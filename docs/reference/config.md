# garden.yml reference

Below is the schema reference for the [Project](#project-configuration) and [Module](#module-configuration) `garden.yml` configuration files. For an introduction to configuring a Garden project,
please look at our [configuration guide](../using-garden/configuration-files.md).

The reference is divided into four sections. The [first section](#project-configuration-keys) lists and describes the available schema keys for the project level configuration, and the [second section](#project-yaml-schema) contains the project level YAML schema.

The [third section](#module-configuration-keys) lists and describes the available schema keys for the module level configuration, and the [fourth section](#module-yaml-schema) contains the module level YAML schema.

Note that individual providers, e.g. `kubernetes`, add their own project level configuration keys. The provider types are listed on the [Providers page](./providers/README.md).

Likewise, individual module types, e.g. `container`, add additional configuration keys at the module level. Module types are listed on the [Module Types page](./module-types/README.md).

Please refer to those for more details on provider and module configuration.

## Project configuration keys

### `project`

Configuration for a Garden project. This should be specified in the garden.yml file in your project root.

| Type | Required |
| ---- | -------- |
| `object` | Yes
### `project.apiVersion`
[project](#project) > apiVersion

The schema version of this project's config (currently not used).

| Type | Required | Allowed Values |
| ---- | -------- | -------------- |
| `string` | Yes | "garden.io/v0"
### `project.kind`
[project](#project) > kind



| Type | Required | Allowed Values |
| ---- | -------- | -------------- |
| `string` | Yes | "Project"
### `project.name`
[project](#project) > name

The name of the project.

| Type | Required |
| ---- | -------- |
| `string` | Yes

Example:
```yaml
project:
  ...
  name: "my-sweet-project"
```
### `project.defaultEnvironment`
[project](#project) > defaultEnvironment

The default environment to use when calling commands without the `--env` parameter.

| Type | Required |
| ---- | -------- |
| `string` | No
### `project.environmentDefaults`
[project](#project) > environmentDefaults

DEPRECATED - Please use the `providers` field instead, and omit the environments key in the configured provider to use it for all environments, and use the `variables` field to configure variables across all environments.

| Type | Required |
| ---- | -------- |
| `object` | No

Example:
```yaml
project:
  ...
  environmentDefaults:
    providers: []
    variables: {}
```
### `project.environmentDefaults.providers[]`
[project](#project) > [environmentDefaults](#project.environmentdefaults) > providers

DEPRECATED - Please use the top-level `providers` field instead, and if needed use the `environments` key on the provider configurations to limit them to specific environments.

| Type | Required |
| ---- | -------- |
| `array[object]` | No
### `project.environmentDefaults.providers[].name`
[project](#project) > [environmentDefaults](#project.environmentdefaults) > [providers](#project.environmentdefaults.providers[]) > name

The name of the provider plugin to use.

| Type | Required |
| ---- | -------- |
| `string` | Yes

Example:
```yaml
project:
  ...
  environmentDefaults:
    providers: []
    variables: {}
    ...
    providers:
      - name: "local-kubernetes"
```
### `project.environmentDefaults.providers[].environments[]`
[project](#project) > [environmentDefaults](#project.environmentdefaults) > [providers](#project.environmentdefaults.providers[]) > environments

If specified, this provider will only be used in the listed environments. Note that an empty array effectively disables the provider. To use a provider in all environments, omit this field.

| Type | Required |
| ---- | -------- |
| `array[string]` | No

Example:
```yaml
project:
  ...
  environmentDefaults:
    providers: []
    variables: {}
    ...
    providers:
      - environments:
        - dev
        - stage
```
### `project.environmentDefaults.variables`
[project](#project) > [environmentDefaults](#project.environmentdefaults) > variables

A key/value map of variables that modules can reference when using this environment. These take precedence over variables defined in the top-level `variables` field.

| Type | Required |
| ---- | -------- |
| `object` | No
### `project.environments`
[project](#project) > environments

A list of environments to configure for the project.

| Type | Required |
| ---- | -------- |
| `alternatives` | No

Example:
```yaml
project:
  ...
  environments: [{"name":"local","providers":[{"name":"local-kubernetes","environments":[]}],"variables":{}}]
```
### `project.providers[]`
[project](#project) > providers

A list of providers that should be used for this project, and their configuration. Please refer to individual plugins/providers for details on how to configure them.

| Type | Required |
| ---- | -------- |
| `array[object]` | No
### `project.providers[].name`
[project](#project) > [providers](#project.providers[]) > name

The name of the provider plugin to use.

| Type | Required |
| ---- | -------- |
| `string` | Yes

Example:
```yaml
project:
  ...
  providers:
    - name: "local-kubernetes"
```
### `project.providers[].environments[]`
[project](#project) > [providers](#project.providers[]) > environments

If specified, this provider will only be used in the listed environments. Note that an empty array effectively disables the provider. To use a provider in all environments, omit this field.

| Type | Required |
| ---- | -------- |
| `array[string]` | No

Example:
```yaml
project:
  ...
  providers:
    - environments:
      - dev
      - stage
```
### `project.providers[].config`
[project](#project) > [providers](#project.providers[]) > config



| Type | Required |
| ---- | -------- |
| `lazy` | Yes
### `project.sources[]`
[project](#project) > sources

A list of remote sources to import into project.

| Type | Required |
| ---- | -------- |
| `array[object]` | No
### `project.sources[].name`
[project](#project) > [sources](#project.sources[]) > name

The name of the source to import

| Type | Required |
| ---- | -------- |
| `string` | Yes
### `project.sources[].repositoryUrl`
[project](#project) > [sources](#project.sources[]) > repositoryUrl

A remote repository URL. Currently only supports git servers. Must contain a hash suffix pointing to a specific branch or tag, with the format: <git remote url>#<branch|tag>

| Type | Required |
| ---- | -------- |
| `string` | Yes

Example:
```yaml
project:
  ...
  sources:
    - repositoryUrl: "git+https://github.com/org/repo.git#v2.0"
```
### `project.variables`
[project](#project) > variables

Variables to configure for all environments.

| Type | Required |
| ---- | -------- |
| `object` | No


## Project YAML schema
```yaml
project:
  apiVersion: garden.io/v0
  kind:
  name:
  defaultEnvironment: ''
  environmentDefaults:
    providers:
      - name:
        environments:
    variables: {}
  environments:
  providers:
    - name:
      environments:
      config:
  sources:
    - name:
      repositoryUrl:
  variables: {}
```

## Module configuration keys

### `module`

Configure a module whose sources are located in this directory.

| Type | Required |
| ---- | -------- |
| `object` | Yes
### `module.apiVersion`
[module](#module) > apiVersion

The schema version of this module's config (currently not used).

| Type | Required | Allowed Values |
| ---- | -------- | -------------- |
| `string` | Yes | "garden.io/v0"
### `module.type`
[module](#module) > type

The type of this module.

| Type | Required |
| ---- | -------- |
| `string` | Yes

Example:
```yaml
module:
  ...
  type: "container"
```
### `module.name`
[module](#module) > name

The name of this module.

| Type | Required |
| ---- | -------- |
| `string` | Yes

Example:
```yaml
module:
  ...
  name: "my-sweet-module"
```
### `module.description`
[module](#module) > description



| Type | Required |
| ---- | -------- |
| `string` | No
### `module.repositoryUrl`
[module](#module) > repositoryUrl

A remote repository URL. Currently only supports git servers. Must contain a hash suffix pointing to a specific branch or tag, with the format: <git remote url>#<branch|tag>

Garden will import the repository source code into this module, but read the module's
config from the local garden.yml file.

| Type | Required |
| ---- | -------- |
| `string` | No

Example:
```yaml
module:
  ...
  repositoryUrl: "git+https://github.com/org/repo.git#v2.0"
```
### `module.allowPublish`
[module](#module) > allowPublish

When false, disables pushing this module to remote registries.

| Type | Required |
| ---- | -------- |
| `boolean` | No
### `module.build`
[module](#module) > build

Specify how to build the module. Note that plugins may define additional keys on this object.

| Type | Required |
| ---- | -------- |
| `object` | No
### `module.build.dependencies[]`
[module](#module) > [build](#module.build) > dependencies

A list of modules that must be built before this module is built.

| Type | Required |
| ---- | -------- |
| `array[object]` | No

Example:
```yaml
module:
  ...
  build:
    ...
    dependencies:
      - name: some-other-module-name
```
### `module.build.dependencies[].name`
[module](#module) > [build](#module.build) > [dependencies](#module.build.dependencies[]) > name

Module name to build ahead of this module.

| Type | Required |
| ---- | -------- |
| `string` | Yes
### `module.build.dependencies[].copy[]`
[module](#module) > [build](#module.build) > [dependencies](#module.build.dependencies[]) > copy

Specify one or more files or directories to copy from the built dependency to this module.

| Type | Required |
| ---- | -------- |
| `array[object]` | No
### `module.build.dependencies[].copy[].source`
[module](#module) > [build](#module.build) > [dependencies](#module.build.dependencies[]) > [copy](#module.build.dependencies[].copy[]) > source

POSIX-style path or filename of the directory or file(s) to copy to the target.

| Type | Required |
| ---- | -------- |
| `string` | Yes
### `module.build.dependencies[].copy[].target`
[module](#module) > [build](#module.build) > [dependencies](#module.build.dependencies[]) > [copy](#module.build.dependencies[].copy[]) > target

POSIX-style path or filename to copy the directory or file(s) to (defaults to same as source path).

| Type | Required |
| ---- | -------- |
| `string` | No


## Module YAML schema
```yaml
module:
  apiVersion: garden.io/v0
  type:
  name:
  description:
  repositoryUrl:
  allowPublish: true
  build:
    dependencies:
      - name:
        copy:
          - source:
            target: ''
```

