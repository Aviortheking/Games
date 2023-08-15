# Fi3D Slicer as a Service

## API key

add `Authorization: Bearer {token}`

## API Endpoints

|            endpoint            | method | permission required | cookie access | api access |                Description                |
| :----------------------------: | :----: | :-----------------: | :-----------: | :--------: | :---------------------------------------: |
|         /api/v1/users          |  GET   |      user.list      |      no       |     no     |         List every user accounts          |
|         /api/v1/users          |  POST  |     user.create     |      no       |     no     |           Create a new account            |
|     /api/v1/users/{userId}     |  GET   |      user.get       |      yes      |    yes     |         Get a user's informations         |
|     /api/v1/users/{userId}     |  PUT   |      user.set       |      yes      |    yes     |         Set a user's informations         |
| /api/v1/users/{userId}/configs |  GET   |     configs.get     |      yes      |    yes     | get the list of the user's configurations |
| /api/v1/users/{userId}/configs |  POST  |   configs.create    |      yes      |    yes     |    Add a new configuration to the user    |
|  /api/v1/users/{userId}/keys   |  GET   |      keys.get       |      yes      |     no     |   get the list of API key for the user    |
|  /api/v1/users/{userId}/keys   |  POST  |     keys.create     |      yes      |     no     |     create a new API key for the user     |
|    /api/v1/slice/{configId}    |  POST  |     slice.slice     |      yes      |    yes     |        run the main website action        |

endpoints not available through API can still be accessed by admins with the `admin.` prefix to the permission

## API Key Permissions

### `slicing:*` permissions related to the slicing

|     name      |       Description       |
| :-----------: | :---------------------: |
| slicing:slice | Slice the specified STL |

### `configs:*` permissions related to the configuration files

|      name      |            description             |
| :------------: | :--------------------------------: |
| configs:create |  Create a new configuration file   |
|  configs:get   | Get an existing configuration file |
