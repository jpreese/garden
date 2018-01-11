import { readFileSync } from "fs"
import { join } from "path"
import * as yaml from "js-yaml"
import * as Joi from "joi"
import { identifierRegex, JoiIdentifier, JoiLiteral, SimpleLiteral } from "./common"
import { ConfigurationError } from "../exceptions"
import { GardenContext } from "../context"

const PROJECT_CONFIG_FILENAME = "garden-project.yml"

export interface ProviderConfig {
  type: string
  name?: string
}

export interface EnvironmentConfig {
  providers: { [key: string]: ProviderConfig }
}

export interface ProjectConfig {
  version: string
  name: string
  environments: { [key: string]: EnvironmentConfig }
  constants: { [key: string]: SimpleLiteral }
}

const baseSchema = Joi.object().keys({
  version: Joi.string().default("0").only("0"),
  name: JoiIdentifier().required(),
  environments: Joi.object().keys({
    providers: Joi.object().pattern(identifierRegex, Joi.object().keys({
      type: JoiIdentifier().required(),
    })),
  }),
  constants: Joi.object().pattern(/\w\d/i, JoiLiteral()).default(() => {}, "{}"),
}).required()

export async function loadProjectConfig(projectRoot: string): Promise<ProjectConfig> {
  const path = join(projectRoot, PROJECT_CONFIG_FILENAME)
  let fileData
  let config

  try {
    fileData = readFileSync(path)
  } catch (err) {
    throw new ConfigurationError(`Could not find ${PROJECT_CONFIG_FILENAME} in project root ${projectRoot}`, err)
  }

  try {
    config = yaml.safeLoad(fileData)
  } catch (err) {
    throw new ConfigurationError(`Could not parse ${PROJECT_CONFIG_FILENAME} as valid YAML`, err)
  }

  return <ProjectConfig>baseSchema.validate(config).value
}