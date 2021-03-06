/*
 * Copyright (C) 2018 Garden Technologies, Inc. <info@garden.io>
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import deline = require("deline")
import * as Joi from "joi"
import { joiArray, joiUserIdentifier } from "./common"

export interface TaskSpec { }

export interface BaseTaskSpec extends TaskSpec {
  name: string
  dependencies: string[]
  description?: string
  timeout: number | null
}

export const baseTaskSpecSchema = Joi.object()
  .keys({
    name: joiUserIdentifier()
      .required()
      .description("The name of the task."),
    description: Joi.string().optional()
      .description("A description of the task."),
    dependencies: joiArray(Joi.string())
      .description(deline`
        The names of any tasks that must be executed, and the names of any
        services that must be running, before this task is executed.
      `),
    timeout: Joi.number()
      .optional()
      .allow(null)
      .default(null)
      .description("Maximum duration (in seconds) of the task's execution."),
  })
  .description("Required configuration for module tasks.")

export interface TaskConfig<T extends TaskSpec = TaskSpec> extends BaseTaskSpec {
  // Plugins can add custom fields that are kept here
  spec: T
}

export const taskConfigSchema = baseTaskSpecSchema
  .keys({
    spec: Joi.object()
      .meta({ extendable: true })
      .description("The task's specification, as defined by its provider plugin."),
  })
  .description("The configuration for a module's task.")

export const taskSchema = Joi.object()
  .options({ presence: "required" })
  .keys({
    name: joiUserIdentifier()
      .description("The name of the task."),
    description: Joi.string().optional()
      .description("A description of the task."),
    module: Joi.object().unknown(true),
    config: taskConfigSchema,
    spec: Joi.object()
      .meta({ extendable: true })
      .description("The configuration of the task (specific to each plugin)."),
  })
