import { CodeGeneratorRequest, CodeGeneratorResponse } from "./proto/plugin";
import { readFileSync } from "fs";

const stdin = readFileSync(0);
const request = CodeGeneratorRequest.deserializeBinary(stdin);

const response = new CodeGeneratorResponse();

const file = new CodeGeneratorResponse.File();
file.setName("hello.ts");
response.addFile(file);

process.stdout.write(response.serializeBinary());
