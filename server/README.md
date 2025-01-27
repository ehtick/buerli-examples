# The ClassCAD Server

## Getting Started

This package provides a default setup for Windows systems.

> ⚠️ To get started with the linux server please follow the instructions here [dockerfile](./dockerfile)!

**Install**

```
# working dir 'server'
yarn
```

**Download ccapp**

Go to [buerli.io](https://buerli.io), sign up for a **user account** and download the required application package. Copy the downloaded `ccapp` side by side to this REAMDE in the `server` folder and rename it to `FreeBaseModeling.ccapp`

**Start the server**

```
# working dir 'server'
yarn start
```

The server should now be available at http://localhost:9091. Please check the status:

```
http://localhost:9091/status
```

Now, you are ready to start the [client](../client/README.md)
