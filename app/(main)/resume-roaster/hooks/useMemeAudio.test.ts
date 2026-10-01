import { describe, expect, it } from "vitest";
import fs from "fs";
import path from "path";
import { MEME_PATHS, shuffleDeck } from "./useMemeAudio";

describe("useMemeAudio - Assets & Rotation", () => {
  it("all defined meme audio files exist on disk in the public folder", () => {
    const publicDir = path.resolve(process.cwd(), "public");

    const allPaths: string[] = [
      ...MEME_PATHS.beforeUpload,
      ...MEME_PATHS.whileLoading,
      ...MEME_PATHS.afterLoading.high,
      ...MEME_PATHS.afterLoading.medium,
      ...MEME_PATHS.afterLoading.less,
    ];

    expect(allPaths.length).toBeGreaterThan(0);

    for (const relPath of allPaths) {
      // e.g. /Memes/before_upload/Namaskaram.mp3 -> <cwd>/public/Memes/before_upload/Namaskaram.mp3
      const normalizedPath = relPath.startsWith("/") ? relPath.slice(1) : relPath;
      const fullPath = path.join(publicDir, normalizedPath);
      const exists = fs.existsSync(fullPath);
      expect(exists, `Missing audio file on disk: ${fullPath}`).toBe(true);
    }
  });

  it("shuffleDeck returns a full permutation containing all original items", () => {
    const original = ["sound1.mp3", "sound2.mp3", "sound3.mp3", "sound4.mp3"];
    const shuffled = shuffleDeck(original);

    expect(shuffled.length).toBe(original.length);
    expect(shuffled.sort()).toEqual([...original].sort());
  });

  it("shuffleDeck preserves items when given single item or empty list", () => {
    expect(shuffleDeck([])).toEqual([]);
    expect(shuffleDeck(["single.mp3"])).toEqual(["single.mp3"]);
  });
});
