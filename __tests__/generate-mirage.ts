import {
  CodeGeneratorRequest,
  CodeGeneratorResponse,
} from "../src/proto/plugin";

import {
  FileDescriptorProto,
  DescriptorProto,
  FieldDescriptorProto,
} from "google-protobuf/google/protobuf/descriptor_pb";

import { generateMirage } from "../src/generate-mirage";

test("foo", () => {
  const request = new CodeGeneratorRequest();
  const fd = new FileDescriptorProto();
  const messageType = new DescriptorProto();

  messageType.setName("Animal");
  messageType.setFieldList([
    new FieldDescriptorProto().setName("name").setNumber(1),
  ]);

  fd.setName("example.proto");
  fd.setSyntax("proto3");
  fd.setPackage("example");
  fd.setMessageTypeList([messageType]);

  request.setFileToGenerateList(["example.proto"]);
  request.setProtoFileList([fd]);

  const response = generateMirage(request);

  expect(response).toHaveFileWith(
    "mirage/config.ts",
    'this.post("/ListAnimals", animals.list)'
  );

  expect(response).toHaveFileWith(
    "mirage/handlers/animals.ts",
    "export function list(): void"
  );

  expect(response).toHaveFileWith(
    "mirage/models/animal.ts",
    'import { Animal } from "waypoint-pb"',
    "export default Model.extend",
    "toProtobuf(): Animal {"
  );

  expect(response).toHaveFileWith(
    "mirage/factories/animal.ts",
    "export default Factory.extend"
  );
});

expect.extend({
  toHaveFileWith(
    received: CodeGeneratorResponse,
    path: string,
    ...contents: string[]
  ) {
    const file = received.getFileList().find((f) => f.getName() === path);
    if (!file) {
      return {
        pass: false,
        message: () =>
          `expected response to contain ${path}\nactually contained:\n${received
            .getFileList()
            .map((f) => "- " + f.getName())
            .join("\n")}`,
      };
    }

    for (const content of contents) {
      if (!file.getContent().includes(content)) {
        return {
          pass: false,
          message: () =>
            `expected ${path} to contain ${content}\nactually contained:\n${file.getContent()}`,
        };
      }
    }

    return {
      pass: true,
      message: () => `expected ${path} not to contain ${contents.join(" OR ")}`,
    };
  },
});

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace jest {
    interface Matchers<R> {
      toHaveFileWith(path: string, ...contents: string[]): R;
    }
  }
}
