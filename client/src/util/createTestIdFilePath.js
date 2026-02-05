/**
 * This file is used to create the TEST_ID file paths
 */
export default function createTestIdFilePath(...args) {
  return args.join("/");
}
