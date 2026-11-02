// interactive terminal for the home page
// plain js, no framework, no animations, no blinking cursor

(function () {
  var term = document.getElementById("terminal");
  if (!term) return;

  var output = document.getElementById("term-output");
  var form = document.getElementById("term-form");
  var input = document.getElementById("term-input");
  var typedEl = document.getElementById("term-typed");

  var PROMPT = term.getAttribute("data-prompt") || "$";
  var USER = PROMPT.split("@")[0] || "user";
  var HOST = (PROMPT.split("@")[1] || "host:").split(":")[0];

  var POSTS_URL = term.getAttribute("data-posts-url") || "/posts/";
  var WRITEUPS_URL = term.getAttribute("data-writeups-url") || "/writeups/";
  var ABOUT_URL = term.getAttribute("data-about-url") || "/about/";
  var TAGS_URL = term.getAttribute("data-tags-url") || "/tags/";
  var GITHUB_URL = term.getAttribute("data-github-url") || "";
  var BLOG = term.getAttribute("data-blog") || "sec blog";

  // ---------- content shipped from jekyll ----------

  var posts = [];
  var textFiles = {};

  try {
    posts = JSON.parse(document.getElementById("term-data").textContent) || [];
  } catch (err) {
    posts = [];
  }

  try {
    textFiles = JSON.parse(document.getElementById("term-fs").textContent) || {};
  } catch (err) {
    textFiles = {};
  }

  posts.sort(function (a, b) {
    return a.date < b.date ? 1 : a.date > b.date ? -1 : 0;
  });

  var writeups = posts.filter(function (post) {
    return post.category === "writeups";
  });

  // virtual filesystem: the terminal cwd, plus a home directory of readable files
  var HOME = "~";
  var cwd = "~";
  var history = [];
  var hIndex = 0;

  function normPath(target) {
    if (!target || target === "~" || target === "/") return "~";

    var i;
    target = String(target).replace(/\/+$/, "");
    target = target.replace(/^~\/?/, "");

    if (target === "" || target === "." || target === ".." || target === "/") return "~";

    target = target.toLowerCase();
    target = target.replace(/\.(txt|md|json)$/, "");

    if (target === "me" || target === "ammar" || target === "self") return "aboutme";

    if (target === "rules" || target === "policy" || target === "content") return "rules";
    if (target === "readme" || target === "index") return "readme";

    return target;
  }

  function hasFile(p) {
    return Object.prototype.hasOwnProperty.call(textFiles, p);
  }

  function resolvePath(p) {
    if (!p || p === "~" || p === "/" || p === "~/") return "~";

    var raw = String(p);
    var fromHome = /^~?\/|^~\//.test(raw) || raw.indexOf("~") === 0;
    var cleaned = raw.replace(/^~\/?/, "").replace(/^\/+/, "").replace(/\/+$/, "");

    if (!cleaned || cleaned === ".") return cwd;
    if (cleaned === "..") return cwd === "~" ? "~" : "~";

    // "cd posts" is relative to the current directory, "cd ~/posts" is absolute
    if (fromHome) return normPath(cleaned);
    if (cwd === "~") return normPath(cleaned);
    return normPath(cwd + "/" + cleaned);
  }

  function postFor(p) {
    return posts.filter(function (post) {
      return post.slug.toLowerCase() === p;
    })[0];
  }

  var MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

  function fmtDate(ymd) {
    var parts = String(ymd).split("-");
    if (parts.length !== 3) return ymd;
    var month = MONTHS[parseInt(parts[1], 10) - 1] || parts[1];
    var day = parts[2].length === 1 ? "0" + parts[2] : parts[2];
    return month + " " + day + " " + parts[0];
  }

  // ---------- output helpers ----------

  function el(tag, cls, text) {
    var node = document.createElement(tag);
    if (cls) node.className = cls;
    if (text !== undefined && text !== null) node.textContent = text;
    return node;
  }

  function promptSpan() {
    var s = el("span", "ps1");
    s.appendChild(el("span", "u", USER));
    s.appendChild(el("span", "punct", "@"));
    s.appendChild(el("span", "h", HOST));
    s.appendChild(el("span", "path", ":" + cwd + "$"));
    return s;
  }

  function echo(cmd) {
    var p = el("p", "cmd");
    p.appendChild(promptSpan());
    p.appendChild(document.createTextNode(" " + cmd));
    output.appendChild(p);
  }

  function print(text, cls) {
    var p = el("p", cls ? "res " + cls : "res", text);
    output.appendChild(p);
    return p;
  }

  function blank() {
    var p = el("p", "res blank", "\u00a0");
    output.appendChild(p);
    return p;
  }

  function printPre(text) {
    var pre = el("pre", null, text);
    output.appendChild(pre);
    return pre;
  }

  function printList(items) {
    if (!items.length) {
      print("empty", "dim");
      return;
    }

    var ul = el("ul", "ls");

    items.forEach(function (post) {
      var li = el("li");
      li.appendChild(el("span", "perm", "-rw-r--r--"));
      li.appendChild(el("time", null, fmtDate(post.date)));
      li.appendChild(el("span", "tag", post.category));

      var a = el("a", null, post.title);
      a.href = post.url;
      li.appendChild(a);

      ul.appendChild(li);
    });

    output.appendChild(ul);
  }

  function printLink(prefix, href, label) {
    var p = el("p", "res");
    p.appendChild(document.createTextNode(prefix));
    var a = el("a", null, label || href);
    a.href = href;
    p.appendChild(a);
    output.appendChild(p);
  }

  function scrollDown() {
    var last = output.lastElementChild;
    if (last && last.scrollIntoView) last.scrollIntoView({ block: "nearest" });
  }

  function pad(text, width) {
    var out = String(text);
    while (out.length < width) out += " ";
    return out;
  }

  function wrap(text, width) {
    var words = String(text).split(/\s+/);
    var lines = [];
    var line = "";

    words.forEach(function (word) {
      if (!line) {
        line = word;
      } else if ((line + " " + word).length <= width) {
        line += " " + word;
      } else {
        lines.push(line);
        line = word;
      }
    });

    if (line) lines.push(line);
    return lines;
  }

  function printText(text) {
    // keep paragraphs, wrap long lines to the terminal width
    var width = 84;
    var blocks = String(text).replace(/\r\n/g, "\n").split(/\n{2,}/);
    var lines = [];

    blocks.forEach(function (block) {
      var inner = [];
      block.split("\n").forEach(function (l) {
        if (!l.trim()) {
          inner.push("");
          return;
        }
        wrap(l.trim(), width).forEach(function (w) {
          inner.push(w);
        });
      });
      lines.push(inner.join("\n"));
    });

    var pre = el("pre", "res-text");
    pre.textContent = lines.join("\n\n");
    output.appendChild(pre);
    return pre;
  }

  function err(name, message) {
    var p = el("p", "res");
    p.appendChild(el("span", "bin", name));
    p.appendChild(document.createTextNode(": " + message));
    output.appendChild(p);
  }

  function listDirEntries() {
    var entries = ["aboutme.txt", "rules.txt", "readme.txt"].concat(
      posts.map(function (p) {
        return p.slug + ".md";
      })
    );
    return entries;
  }

  function printPlainList(entries) {
    var ul = el("ul", "ls plain");

    entries.forEach(function (name) {
      var li = el("li");
      var isFile = hasFile(normPath(name)) || !!postFor(String(name).replace(/\.md$/, ""));
      li.appendChild(el("span", "perm", isFile ? "-rw-r--r--" : "drwxr-xr-x"));
      li.appendChild(el("time", null, isFile ? "1.2K" : "4.0K"));
      li.appendChild(el("span", "tag", isFile ? "file" : "dir"));

      var p = resolvePath(name);
      var post = postFor(String(name).replace(/\.md$/, ""));

      if (hasFile(p) || post) {
        var a = el("a", null, name);
        a.href = post ? post.url : "#";
        if (!post) {
          a.setAttribute("data-file", p);
        }
        li.appendChild(a);
      } else {
        li.appendChild(el("span", "name", name));
      }

      ul.appendChild(li);
    });

    output.appendChild(ul);
  }

  function findPost(query) {
    if (!query) return null;

    var q = query.toLowerCase();
    var i;

    for (i = 0; i < posts.length; i++) {
      if (String(posts[i].slug).toLowerCase() === q) return posts[i];
    }
    for (i = 0; i < posts.length; i++) {
      if (String(posts[i].slug).toLowerCase().indexOf(q) === 0) return posts[i];
    }
    for (i = 0; i < posts.length; i++) {
      if (String(posts[i].title).toLowerCase().indexOf(q) !== -1) return posts[i];
    }

    return null;
  }

  // ---------- help ----------

  var HELP = [
    ["aboutme", "who i am, my focus, my results"],
    ["goto <section>", "jump to a page: posts, writeups, about, rss"],
    ["sections", "list the clickable sections"],
    ["ls [dir]", "list files and posts"],
    ["cat <file>", "read a file, for example cat aboutme"],
    ["latest [n]", "newest n posts, default 5"],
    ["open <slug>", "open a post in the browser"],
    ["search <words>", "search titles, tags and body text"],
    ["tags", "list tags with counts"],
    ["neofetch", "site and author summary"],
    ["links", "github and profile links"],
    ["stats", "post counts by category"],
    ["tree", "site layout"],
    ["cd <dir>", "change directory"],
    ["pwd", "print working directory"],
    ["whoami", "short version"],
    ["history", "commands typed so far"],
    ["clear", "wipe the screen"],
    ["help", "this list"]
  ];

  function helpText() {
    return HELP.map(function (row) {
      return "  " + pad(row[0], 18) + row[1];
    }).join("\n");
  }

  // ---------- commands ----------

  var commands = {};

  commands.help = function () {
    print("built in commands", "dim");
    printPre(helpText());
    print("any post slug also works: cat <slug>, open <slug>", "dim");
  };

  commands.man = function (args) {
    var name = args[0];
    var found = null;

    HELP.forEach(function (r) {
      if (r[0].split(" ")[0] === name) found = r;
    });

    if (found) {
      printPre("  " + pad(found[0], 18) + found[1]);
    } else if (name) {
      err("man", "no entry for " + name);
    } else {
      err("man", "what manual page do you want?");
    }
  };

  commands.aboutme = function () {
    if (hasFile("aboutme")) {
      printText(textFiles.aboutme);
      blank();
      printLink("full page: ", ABOUT_URL, "about");
    }
  };

  commands.links = function () {
    printLink("github      ", GITHUB_URL, GITHUB_URL.replace(/^https?:\/\//, ""));

    var post = findPost("contact");
    if (post) printLink("contact     ", post.url, "contact post");
  };

  commands.stats = function () {
    var counts = {};
    posts.forEach(function (p) {
      counts[p.category] = (counts[p.category] || 0) + 1;
    });

    var rows = ["total posts   " + posts.length];
    Object.keys(counts)
      .sort()
      .forEach(function (k) {
        rows.push(pad(k, 14) + counts[k]);
      });
    rows.push(pad("latest", 14) + (posts.length ? posts[0].date : "n/a"));

    printPre(rows.join("\n"));
  };

  commands.tree = function () {
    printPre(
      [
        "~/",
        "|-- aboutme.txt",
        "|-- rules.txt",
        "|-- readme.txt",
        "|-- posts/",
        posts.map(function (p, i) {
          return "|   " + (i === posts.length - 1 ? "`-- " : "|-- ") + p.slug + ".md";
        }).join("\n"),
        "|-- writeups/",
        writeups.map(function (p, i) {
          return "|   " + (i === writeups.length - 1 ? "`-- " : "|-- ") + p.slug + ".md";
        }).join("\n"),
        "`-- tags/"
      ]
        .filter(function (line) {
          return line !== "";
        })
        .join("\n")
    );
  };

  commands.ls = function (args) {
    var dir = null;
    var i;

    for (i = 0; i < args.length; i++) {
      if (args[i].charAt(0) !== "-") {
        dir = args[i];
        break;
      }
    }

    // no argument means list the current directory
    if (dir === null) {
      if (cwd === "posts") {
        printList(posts);
      } else if (cwd === "writeups") {
        printList(writeups);
      } else if (cwd === "tags") {
        commands.tags();
      } else {
        printPlainList(listDirEntries());
      }
      return;
    }

    var target = resolvePath(dir);

    if (target === "~") {
      printPlainList(listDirEntries());
      return;
    }

    if (target === "posts" || target === "blog") {
      printList(target === "blog" ? posts.filter(function (p) { return p.category !== "writeups"; }) : posts);
      return;
    }

    if (target === "writeups") {
      try {
        printList(writeups);
      } catch (e) {
        printList([]);
      }
      return;
    }

    if (target === "tags") {
      commands.tags();
      return;
    }

    err("ls", "cannot access '" + dir + "': No such file or directory");
  };

  commands.cd = function (args) {
    var raw = args[0] || "~";
    var target = resolvePath(raw);

    var map = {
      "~": HOME,
      posts: "posts",
      writeups: "writeups",
      tags: "tags"
    };

    if (Object.prototype.hasOwnProperty.call(map, target)) {
      cwd = map[target];
      return;
    }

    err("cd", "no such directory: " + raw);
  };

  // navigate to a page, for people who would rather click than type
  commands.goto = function (args) {
    var raw = (args[0] || "").toLowerCase().replace(/^~?\/?/, "").replace(/\/$/, "");

    var map = {
      "": "/",
      "~": "/",
      home: "/",
      posts: POSTS_URL,
      blog: POSTS_URL,
      writeups: WRITEUPS_URL,
      about: ABOUT_URL,
      aboutme: ABOUT_URL,
      tags: TAGS_URL,
      rss: "/feed.xml",
      feed: "/feed.xml",
      github: GITHUB_URL
    };

    if (Object.prototype.hasOwnProperty.call(map, raw) && map[raw]) {
      window.location.href = map[raw];
      return;
    }

    err("goto", "unknown section '" + args[0] + "'. try home, posts, writeups, about, rss");
  };

  commands.sections = function () {
    print("sections, click or type goto <name>", "dim");
    printPre(
      [
        "  " + pad("home", 12) + "this shell",
        "  " + pad("posts", 12) + "every entry, newest first",
        "  " + pad("writeups", 12) + "ctf and machine walkthroughs",
        "  " + pad("about", 12) + "who i am, focus, links",
        "  " + pad("rss", 12) + "subscribe in a reader"
      ].join("\n")
    );

    var p = el("p", "res");
    [
      ["home", "/"],
      ["posts", POSTS_URL],
      ["writeups", WRITEUPS_URL],
      ["about", ABOUT_URL],
      ["rss", "/feed.xml"]
    ].forEach(function (pair, i) {
      if (i) p.appendChild(document.createTextNode("  "));
      var a = el("a", null, pair[0]);
      a.href = pair[1];
      p.appendChild(a);
    });
    output.appendChild(p);
  };

  commands.cat = function (args) {
    if (!args[0]) {
      err("cat", "missing file operand");
      return;
    }

    var raw = args[0];
    var target = resolvePath(raw);

    // posts are readable files
    var post = postFor(String(target).replace(/\.md$/, ""));
    if (post) {
      print(post.title, "strong");
      print(post.date + "  " + post.category + (post.tags.length ? "  #" + post.tags.join(" #") : ""), "dim");
      if (post.description) print(post.description);
      blank();
      printText(post.text);
      blank();
      printLink("read online: ", post.url);
      return;
    }

    if (hasFile(target)) {
      printText(textFiles[target]);
      return;
    }

    // a couple of friendly aliases, so "cat aboutme" works from any directory
    if (target === "posts/aboutme" || target === "aboutme.txt") {
      printText(textFiles.aboutme);
      return;
    }

    err("cat", raw + ": No such file or directory");
  };

  commands.open = function (args) {
    if (!args[0]) {
      err("open", "which one? try ls");
      return;
    }

    var target = resolvePath(args[0]);
    var post = postFor(String(target).replace(/\.md$/, ""));

    if (!post) {
      err("open", "nothing matches '" + args[0] + "'");
      return;
    }

    window.location.href = post.url;
  };

  commands.search = function (args) {
    var q = args.join(" ").toLowerCase().trim();

    if (!q) {
      err("search", "what am i looking for?");
      return;
    }

    var hits = posts.filter(function (post) {
      var hay = [post.title, post.description, (post.tags || []).join(" "), post.text].join(" ").toLowerCase();
      return hay.indexOf(q) !== -1;
    });

    print(hits.length + " match" + (hits.length === 1 ? "" : "es") + " for '" + q + "'", "dim");
    printList(hits);
  };

  commands.tags = function () {
    var counts = {};
    var order = [];

    posts.forEach(function (post) {
      (post.tags || []).forEach(function (tag) {
        if (!counts[tag]) {
          counts[tag] = 0;
          order.push(tag);
        }
        counts[tag] += 1;
      });
    });

    if (!order.length) {
      print("no tags yet", "dim");
      return;
    }

    order.sort(function (a, b) {
      if (counts[a] !== counts[b]) return counts[b] - counts[a];
      return a < b ? -1 : 1;
    });

    printPre(
      order
        .map(function (tag) {
          return "  " + pad("#" + tag, 24) + counts[tag];
        })
        .join("\n")
    );
  };

  commands.latest = function (args) {
    var n = parseInt(args[0], 10);
    if (isNaN(n) || n < 1) n = 5;
    if (n > 50) n = 50;
    printList(posts.slice(0, n));
  };

  commands.whoami = function () {
    print(textFiles.whoami || "");
  };

  commands.neofetch = function () {
    var latest = posts.length ? posts[0].date : "n/a";
    var lines = [
      "  " + USER + "@" + HOST,
      "  " + new Array(USER.length + HOST.length + 1).join("-"),
      "  " + pad("site", 10) + BLOG,
      "  " + pad("os", 10) + "jekyll on github pages",
      "  " + pad("focus", 10) + "binary exploitation (pwn)",
      "  " + pad("posts", 10) + posts.length,
      "  " + pad("writeups", 10) + writeups.length,
      "  " + pad("latest", 10) + latest,
      "  " + pad("uptime", 10) + "since the first box"
    ];

    printPre(lines.join("\n"));
  };

  commands.date = function () {
    print(new Date().toString());
  };

  commands.pwd = function () {
    print(cwd === "~" ? "/home/" + USER : "/home/" + USER + "/" + cwd);
  };

  commands.uptime = function () {
    var days = Math.max(1, Math.round((Date.now() - new Date(2026, 9, 29)) / 86400000));
    print("up " + days + " days, " + posts.length + " entries written");
  };

  commands.history = function () {
    if (!history.length) {
      print("nothing yet", "dim");
      return;
    }

    printPre(
      history
        .map(function (cmd, i) {
          return "  " + pad(i + 1, 4) + cmd;
        })
        .join("\n")
    );
  };

  commands.clear = function () {
    output.innerHTML = "";
  };

  commands.sudo = function () {
    var p = el("p", "res");
    p.appendChild(el("span", "bin", "sudo"));
    p.appendChild(document.createTextNode(": " + USER + " is not in the sudoers file. this incident has been reported."));
    output.appendChild(p);
  };

  commands.exit = function () {
    print("there is no exit. only more boxes.", "dim");
  };

  commands.banner = function () {
    printPre(
      [
        "  " + BLOG,
        "  " + site_tagline(),
        "  type help to see what this shell can do"
      ].join("\n")
    );
  };

  function site_tagline() {
    return term.getAttribute("data-tagline") || "";
  }

  // ---------- run ----------

  function run(raw) {
    var line = raw.replace(/^\s+|\s+$/g, "");

    echo(line);

    if (!line) return;

    history.push(line);
    hIndex = history.length;

    var parts = line.split(/\s+/);
    var name = parts[0].toLowerCase();
    var args = parts.slice(1);

    if (Object.prototype.hasOwnProperty.call(commands, name)) {
      commands[name](args);
    } else if (findPost(name)) {
      // bare slug opens it, like a shell resolving a binary on PATH
      commands.open([name]);
    } else {
      var p = el("p", "res");
      p.appendChild(el("span", "bin", "bash"));
      p.appendChild(document.createTextNode(": " + name + ": command not found. type help"));
      output.appendChild(p);
    }

    scrollDown();
  }

  // ---------- clicking files in ls output ----------

  output.addEventListener("click", function (event) {
    var link = event.target.closest ? event.target.closest("a[data-file]") : null;
    if (!link) return;

    event.preventDefault();
    var file = link.getAttribute("data-file");
    echo("cat " + file + ".txt");
    commands.cat([file]);
    scrollDown();
  });

  // ---------- input ----------

  function syncTyped() {
    typedEl.textContent = input.value;
  }

  form.addEventListener("submit", function (event) {
    event.preventDefault();
    run(input.value);
    input.value = "";
    syncTyped();
    input.focus();
  });

  input.addEventListener("input", syncTyped);

  input.addEventListener("keydown", function (event) {
    if (event.key === "ArrowUp") {
      event.preventDefault();
      if (!history.length) return;
      if (hIndex > 0) hIndex -= 1;
      input.value = history[hIndex] || "";
      syncTyped();
      return;
    }

    if (event.key === "ArrowDown") {
      event.preventDefault();
      if (!history.length) return;
      if (hIndex < history.length - 1) hIndex += 1;
      input.value = hIndex >= history.length - 1 ? "" : history[hIndex];
      if (hIndex >= history.length - 1) hIndex = history.length;
      syncTyped();
      return;
    }

    if (event.key === "Tab") {
      event.preventDefault();

      var value = input.value;
      var parts = value.split(/\s+/);
      var matches = [];

      if (parts.length <= 1) {
        matches = Object.keys(commands).filter(function (name) {
          return name.indexOf(value.toLowerCase()) === 0;
        });
      } else {
        var cmd = parts[0].toLowerCase();
        var frag = parts[parts.length - 1].toLowerCase();
        var pool = [];

        if (cmd === "man") {
          pool = Object.keys(commands);
        } else if (cmd === "cat" || cmd === "open") {
          pool = Object.keys(textFiles).concat(
            posts.map(function (p) {
              return p.slug;
            })
          );
        } else if (cmd === "cd" || cmd === "ls") {
          pool = ["posts", "writeups", "tags"];
        }

        matches = pool
          .filter(function (item) {
            return String(item).indexOf(frag) === 0;
          })
          .map(String);
      }

      if (matches.length === 1) {
        if (parts.length <= 1) {
          input.value = matches[0] + " ";
        } else {
          parts[parts.length - 1] = matches[0];
          input.value = parts.join(" ");
        }
      } else if (matches.length > 1) {
        print(matches.join("  "), "dim");
        scrollDown();
      }

      syncTyped();
      return;
    }

    if (event.key === "l" && (event.ctrlKey || event.metaKey)) {
      event.preventDefault();
      output.innerHTML = "";
      return;
    }

    if (event.key === "c" && event.ctrlKey) {
      event.preventDefault();
      echo(input.value + "^C");
      input.value = "";
      syncTyped();
      scrollDown();
      return;
    }
  });

  term.addEventListener("click", function (event) {
    if (event.target.closest && event.target.closest("a")) return;
    input.focus();
  });

  syncTyped();
})();
