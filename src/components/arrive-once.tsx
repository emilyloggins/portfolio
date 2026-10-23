/**
 * The arrival ritual runs on the first page of a visit only. This runs
 * before paint: if this session has already arrived, the html gets
 * `no-arrive` and the animation is skipped; otherwise the flag is set.
 */
export function ArriveOnce() {
  const code = `try{if(sessionStorage.getItem("arrived"))document.documentElement.classList.add("no-arrive");else sessionStorage.setItem("arrived","1")}catch(e){}`;
  return <script dangerouslySetInnerHTML={{ __html: code }} />;
}
