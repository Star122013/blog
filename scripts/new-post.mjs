#!/usr/bin/env node

import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import process from "node:process";

const USAGE = `Usage:
  npm run new:post -- "Post title"
  npm run new:post -- "Post title" --slug custom-slug`;

function slugify(value) {
	return value
		.toLowerCase()
		.normalize("NFKD")
		.replace(/[\u0300-\u036f]/g, "")
		.replace(/[^a-z0-9]+/g, "-")
		.replace(/^-+|-+$/g, "");
}

function parseArgs(argv) {
	let slugArg = "";
	const titleParts = [];

	for (let index = 0; index < argv.length; index += 1) {
		const token = argv[index];

		if (token === "--slug") {
			slugArg = argv[index + 1] ?? "";
			index += 1;
			continue;
		}

		titleParts.push(token);
	}

	return {
		title: titleParts.join(" ").trim(),
		slugArg: slugArg.trim(),
	};
}

function escapeFrontmatterString(value) {
	return value.replace(/\\/g, "\\\\").replace(/"/g, '\\"');
}

async function main() {
	const { title, slugArg } = parseArgs(process.argv.slice(2));

	if (!title) {
		console.error(USAGE);
		process.exit(1);
	}

	const slug = slugify(slugArg || title);
	if (!slug) {
		console.error("Unable to create slug. Please provide letters or numbers.");
		process.exit(1);
	}

	const postsDir = path.resolve("src/content/post");
	const filePath = path.join(postsDir, `${slug}.md`);
	const now = new Date();
	const today = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(
		now.getDate(),
	).padStart(2, "0")}`;

	const frontmatter = `---
title: "${escapeFrontmatterString(title)}"
description: "Add a short description (50-160 chars)."
publishDate: "${today}"
tags: []
draft: false
pinned: false
# updatedDate: "${today}"
# ogImage: "/social-image.png"
# coverImage:
#   src: "./cover.png"
#   alt: "Describe the cover image"
---

`;

	await mkdir(postsDir, { recursive: true });
	await writeFile(filePath, frontmatter, { encoding: "utf8", flag: "wx" });

	console.log(`Created ${path.relative(process.cwd(), filePath)}`);
}

main().catch((error) => {
	if (error && typeof error === "object" && "code" in error && error.code === "EEXIST") {
		console.error("A post with this slug already exists. Use --slug to pick another filename.");
		process.exit(1);
	}

	console.error(error);
	process.exit(1);
});
