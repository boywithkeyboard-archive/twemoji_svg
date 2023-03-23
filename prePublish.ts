for await (const entry of Deno.readDir('./files')) {
  await Deno.copyFile(`./files/${entry.name}`, `./${entry.name}`)
}
