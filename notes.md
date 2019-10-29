# Quick Start

## Install the serverless cli
```
npm install -g serverless
```

## Or, update the serverless cli from a previous version
```
npm update -g serverless
```

## Create a node-typescript Serverless app
```
sls create --template aws-nodejs-typescript --path your-awesome-project
```

## Resources
[Hello World Node.js Example](https://serverless.com/framework/docs/providers/aws/examples/hello-world/node/) 

[Packaging](https://serverless.com/framework/docs/providers/aws/guide/packaging/)

---

# Notes

### Some issues when I've added `middy`

FATAL ERROR: Ineffective mark-compacts near heap limit Allocation failed - JavaScript heap out of memory.

Fixed it with:
```javascript 
export NODE_OPTIONS=--max_old_space_size=8192
```

[FATAL ERROR: Ineffective mark-compacts near heap limit Allocation failed - JavaScript heap out of memory](https://github.com/serverless/serverless/issues/6503)