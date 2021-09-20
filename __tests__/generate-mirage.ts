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
    "export default Model.extend"
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
    content: string
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
    if (!file.getContent().includes(content)) {
      return {
        pass: false,
        message: () =>
          `expected ${path} to contain ${content}\nactually contained:\n${file.getContent()}`,
      };
    }

    return {
      pass: true,
      message: () => `expected ${path} not to contain ${content}`,
    };
  },
});

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace jest {
    interface Matchers<R> {
      toHaveFileWith(path: string, content: string): R;
    }
  }
}
