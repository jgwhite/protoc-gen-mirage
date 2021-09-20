import { readFileSync } from "fs";

import { CodeGeneratorRequest } from "./proto/plugin";
import { generateMirage } from "./generate-mirage";

const stdin = readFileSync(0);
const request = CodeGeneratorRequest.deserializeBinary(stdin);
const response = generateMirage(request);

process.stdout.write(response.serializeBinary());
