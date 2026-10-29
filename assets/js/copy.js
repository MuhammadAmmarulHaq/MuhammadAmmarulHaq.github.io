// adds a plain copy button to every code block
// no animations on purpose

(function () {
  function write(text) {
    if (navigator.clipboard) {
      return navigator.clipboard.writeText(text);
    }

    // fallback for plain http or older browsers
    var ta = document.createElement("textarea");
    ta.value = text;
    ta.setAttribute("readonly", "");
    ta.style.position = "fixed";
    ta.style.top = "-1000px";
    document.body.appendChild(ta);
    ta.select();
    document.execCommand("copy");
    document.body.removeChild(ta);
    return Promise.resolve();
  }

  document.querySelectorAll(".prose pre").forEach(function (pre) {
    var btn = document.createElement("button");
    btn.type = "button";
    btn.className = "copy";
    btn.textContent = "copy";

    btn.addEventListener("click", function () {
      var code = pre.querySelector("code");
      var text = code ? code.innerText : pre.innerText;

      write(text).then(function () {
        btn.textContent = "copied";
        setTimeout(function () {
          btn.textContent = "copy";
        }, 1500);
      });
    });

    pre.appendChild(btn);
  });
})();
