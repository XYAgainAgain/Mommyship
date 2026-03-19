const shaderCache = new Map();

export async function loadShader(path) {
  if (shaderCache.has(path)) return shaderCache.get(path);
  const resp = await fetch(path);
  if (!resp.ok) throw new Error(`Shader load failed: ${path} (${resp.status})`);
  const text = await resp.text();
  shaderCache.set(path, text);
  return text;
}

export async function loadShaderPair(name) {
  const base = `galaxy/shaders/${name}`;
  const [vert, frag] = await Promise.all([
    loadShader(`${base}.vert`),
    loadShader(`${base}.frag`)
  ]);
  return { vert, frag };
}
