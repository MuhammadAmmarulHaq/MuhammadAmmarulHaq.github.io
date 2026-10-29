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
  var WHOAMI = term.getAttribute("data-whoami") || "";
  var POSTS_URL = term.getAttribute("data-posts-url") || "/posts/";
  var WRITEUPS_URL = term.getAttribute("data-writeups-url") || "/writeups/";
  var ABOUT_URL = term.getAttribute("data-about-url") || "/about/";
  var GITHUB_URL = term.getAttribute("data-github-url") || "";

  var posts = [];
  var dataNode = document.getElementById("term-data");

  if (dataNode) {
    try {
      posts = JSON.parse(dataNode.textContent) || [];
    } catch (err) {
      posts = [];
    }
  }

  posts.sort(function (a, b) {
    if (a.date === b.date) return 0;
    return a.date < b.date ? 1 : -1;
  });

  var writeups = posts.filter(function (p) {
    return p.category === "writeups";
  });

  var history = [];
  var hIndex = 0;

  // ---------- output helpers ----------

  function el(tag, cls, text) {
    var node = document.createElement(tag);
    if (cls) node.className = cls;
    if (text !== undefined && text !== null) node.textContent = text;
    return node;
  }

  function echo(cmd) {
    var p = el("p", "cmd");
    p.appendChild(el("span", "ps1", PROMPT));
    p.appendChild(document.createTextNode(" " + cmd));
    output.appendChild(p);
  }

  function print(text, cls) {
    var p = el("p", cls ? "res " + cls : "res", text);
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

  var MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

  // 2026-10-29 -> Oct 29 2026, same shape as the server rendered list
  function fmtDate(ymd) {
    var parts = String(ymd).split("-");

    if (parts.length !== 3) return ymd;

    var month = MONTHS[parseInt(parts[1], 10) - 1] || parts[1];
    var day = parts[2].length === 1 ? "0" + parts[2] : parts[2];

    return month + " " + day + " " + parts[0];
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

  function openPost(post) {
    window.location.href = post.url;
  }

  function go(url) {
    window.location.href = url;
  }

  // ---------- help text ----------

  var HELP = [
    ["ls [dir]", "list posts, writeups, blog or tags"],
    ["latest [n]", "newest entries, default 5"],
    ["cat <slug>", "summary of one post"],
    ["open <slug>", "open that post"],
    ["search <words>", "search titles, tags and text"],
    ["cd <dir>", "go to posts, writeups, about or home"],
    ["whoami", "who runs this site"],
    ["about", "about page"],
    ["contact", "where to find me"],
    ["neofetch", "site stats"],
    ["date / pwd", "the usual"],
    ["history", "what you already typed"],
    ["clear", "wipe the screen"]
  ];

  function helpText() {
    return HELP.map(function (row) {
      return "  " + pad(row[0], 18) + row[1];
    }).join("\n");
  }

  // ---------- commands ----------

  var commands = {};

  commands.help = function () {
    print("commands:", "dim");
    printPre(helpText());
  };

  commands.man = function (args) {
    var name = args[0];
    var row = null;

    HELP.forEach(function (r) {
      if (r[0].split(" ")[0] === name) row = r;
    });

    if (row) {
      printPre("  " + pad(row[0], 18) + row[1]);
    } else if (name) {
      print("man: no entry for " + name, "err");
    } else {
      print("man: what page?", "err");
    }
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

    dir = dir ? dir.replace(/^~?\/+/, "").replace(/\/+$/, "") : "";

    if (dir === "" || dir === "." || dir === "posts") {
      printList(posts);
    } else if (dir === "writeups") {
      printList(writeups);
    } else if (dir === "blog") {
      printList(
        posts.filter(function (p) {
          return p.category !== "writeups";
        })
      );
    } else if (dir === "tags") {
      commands.tags([]);
    } else {
      print("ls: cannot access '" + dir + "': No such file or directory", "err");
    }
  };

  commands.latest = function (args) {
    var n = parseInt(args[0], 10);
    if (isNaN(n) || n < 1) n = 5;
    if (n > 50) n = 50;

    printList(posts.slice(0, n));
  };

  commands.cat = function (args) {
    if (!args[0]) {
      print("cat: missing file operand", "err");
      return;
    }

    var post = findPost(args[0]);

    if (!post) {
      print("cat: " + args[0] + ": No such file or directory", "err");
      return;
    }

    print(post.title, "strong");
    print(
      post.date +
        "  " +
        post.category +
        (post.tags.length ? "  #" + post.tags.join(" #") : ""),
      "dim"
    );

    if (post.description) print(post.description);

    printLink("read: ", post.url);
  };

  commands.open = function (args) {
    if (!args[0]) {
      print("open: which one? try ls", "err");
      return;
    }

    var post = findPost(args[0]);

    if (!post) {
      print("open: nothing matches '" + args[0] + "'", "err");
      return;
    }

    openPost(post);
  };

  commands.search = function (args) {
    var q = args.join(" ").toLowerCase().trim();

    if (!q) {
      print("search: what am i looking for?", "err");
      return;
    }

    var hits = posts.filter(function (post) {
      var hay = [
        post.title,
        post.description,
        (post.tags || []).join(" "),
        post.text
      ]
        .join(" ")
        .toLowerCase();

      return hay.indexOf(q) !== -1;
    });

    print(
      hits.length + " match" + (hits.length === 1 ? "" : "es") + " for '" + q + "'",
      "dim"
    );
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
          return "  " + pad("#" + tag, 22) + counts[tag];
        })
        .join("\n")
    );
  };

  commands.cd = function (args) {
    var target = (args[0] || "~").toLowerCase().replace(/\/+$/, "");
    var map = {
      "": "/",
      "~": "/",
      "/": "/",
      "..": "/",
      "home": "/",
      "~/": "/",
      "posts": POSTS_URL,
      "~/posts": POSTS_URL,
      "writeups": WRITEUPS_URL,
      "~/writeups": WRITEUPS_URL,
      "about": ABOUT_URL,
      "~/about": ABOUT_URL
    };

    if (Object.prototype.hasOwnProperty.call(map, target)) {
      go(map[target]);
    } else {
      print("cd: no such directory: " + target, "err");
    }
  };

  commands.whoami = function () {
    print(WHOAMI);
  };

  commands.about = function () {
    print(WHOAMI);
    printLink("about: ", ABOUT_URL);
  };

  commands.contact = function () {
    if (GITHUB_URL) printLink("github:  ", GITHUB_URL);
    printLink("about:   ", ABOUT_URL);
    print("writeups and ctf notes only. lab content, no live targets.", "dim");
  };

  commands.neofetch = function () {
    var latest = posts.length ? posts[0].date : "n/a";
    var lines = [
      "  " + PROMPT.replace(/:.*$/, ""),
      "  -----------------------",
      "  " + pad("os", 10) + "jekyll on github pages",
      "  " + pad("shell", 10) + "sh",
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
    print("/home/" + PROMPT.replace(/@.*$/, ""));
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
    print("ammar is not in the sudoers file. this incident has been logged.", "err");
  };

  commands.exit = function () {
    print("there is no exit. only more boxes.", "dim");
  };

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
    } else {
      print("bash: " + name + ": command not found. type help", "err");
    }

    scrollDown();
  }

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
    // history
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

    // tab completion
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

        if (cmd === "cat" || cmd === "open" || cmd === "man") {
          matches = (cmd === "man" ? Object.keys(commands) : posts.map(function (p) { return p.slug; }))
            .filter(function (item) {
              return String(item).indexOf(frag) === 0;
            })
            .map(String);
        }
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

    // ctrl+l clears
    if (event.key === "l" && (event.ctrlKey || event.metaKey)) {
      event.preventDefault();
      output.innerHTML = "";
      return;
    }

    // ctrl+c aborts the line
    if (event.key === "c" && event.ctrlKey) {
      event.preventDefault();
      echo(input.value + "^C");
      input.value = "";
      syncTyped();
      scrollDown();
      return;
    }
  });

  // clicking anywhere in the terminal focuses the input
  term.addEventListener("click", function (event) {
    if (event.target.closest && event.target.closest("a")) return;
    input.focus();
  });

  // keep the invisible input and the visible text in sync
  syncTyped();
})();
