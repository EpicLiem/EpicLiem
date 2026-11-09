// Release a stalled server section to its client retry without delaying its sibling.
export async function initialRead(request, timeoutMs = 1500) {
  let timer;
  try {
    return await Promise.race([request, new Promise(resolve => { timer = setTimeout(()=>resolve(null),timeoutMs); })]);
  } catch { return null; }
  finally { clearTimeout(timer); }
}
