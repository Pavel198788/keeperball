/*
  Турнир: расчёт таблицы по правилам кипербола и вывод календаря, таблицы,
  составов и блока «Сезон сейчас». Данные — window.SITE_DATA (data/site-data.js).
  Подключается после data/site-data.js и assets/js/site.js (нужен KB.el).

  Правила очков (презентация, раздел «Очки» и «Серия пенальти»):
    победа в кипербатле — 1 очко (в плей-офф очко не даётся, только фора в 1 мяч);
    победа в матче (футбольный матч + обязательная серия пенальти) — 2 очка;
    ничьих нет; в матче разыгрывается 3 очка: 3:0 или 2:1.
  Если у сезона заполнено pointsOverride — очки берутся из него (итоги организатора).

  computeStandings — чистая функция, её проверяет tools/test_standings.mjs.
*/
(function (root) {
  "use strict";

  var KB = root ? (root.KB = root.KB || {}) : {};

  var MONTHS = ["января", "февраля", "марта", "апреля", "мая", "июня", "июля",
    "августа", "сентября", "октября", "ноября", "декабря"];
  var WEEKDAYS = ["воскресенье", "понедельник", "вторник", "среда", "четверг", "пятница", "суббота"];
  var PENDING_TEXT = "разбивка уточняется";

  /* ---------- Расчёт ---------- */

  function isScore(s) {
    return !!s && typeof s.home === "number" && typeof s.away === "number";
  }

  function hasBreakdown(m) {
    return !!(m.keeperbattle || m.winner || isScore(m.main));
  }

  // Итоговый счёт матча: основной матч + серия пенальти, если разбивка есть; иначе — как опубликован.
  function finalScore(m) {
    if (isScore(m.main)) {
      var pen = isScore(m.penalties) ? m.penalties : { home: 0, away: 0 };
      return { home: m.main.home + pen.home, away: m.main.away + pen.away };
    }
    if (isScore(m.scoreAsPublished)) return m.scoreAsPublished;
    return null;
  }

  // Победитель матча: поле winner, иначе — по сумме основного матча и серии.
  function matchWinner(m) {
    if (m.winner === "home" || m.winner === "away") return m.winner;
    if (isScore(m.main) && isScore(m.penalties)) {
      var h = m.main.home + m.penalties.home;
      var a = m.main.away + m.penalties.away;
      if (h !== a) return h > a ? "home" : "away";
    }
    return null;
  }

  function teamIndex(season) {
    var map = {};
    (season && season.teams || []).forEach(function (t) { if (t && t.id) map[t.id] = t; });
    return map;
  }

  function teamName(season, id) {
    var t = teamIndex(season)[id];
    return t ? t.name : String(id);
  }

  function computeStandings(season) {
    season = season || {};
    var rows = {};
    var order = [];

    function ensure(id, team) {
      if (rows[id]) return rows[id];
      rows[id] = {
        teamId: id,
        name: team ? team.name : String(id),
        logo: team && team.logo ? team.logo : null,
        played: 0, battlesWon: 0, matchesWon: 0,
        goalsFor: 0, goalsAgainst: 0, points: 0,
        unconfirmed: 0
      };
      order.push(id);
      return rows[id];
    }

    (season.teams || []).forEach(function (t) { if (t && t.id) ensure(t.id, t); });
    var known = teamIndex(season);

    (season.matches || []).forEach(function (m) {
      if (!m || m.home == null || m.away == null) return;
      var home = ensure(m.home, known[m.home]);
      var away = ensure(m.away, known[m.away]);
      var score = finalScore(m);
      var winner = matchWinner(m);
      if (score) {
        home.played++; away.played++;
        home.goalsFor += score.home; home.goalsAgainst += score.away;
        away.goalsFor += score.away; away.goalsAgainst += score.home;
        if (!hasBreakdown(m)) { home.unconfirmed++; away.unconfirmed++; }
      }
      var side = { home: home, away: away };
      if (m.keeperbattle === "home" || m.keeperbattle === "away") {
        side[m.keeperbattle].battlesWon++;
        if (!m.playoff) side[m.keeperbattle].points += 1;
      }
      if (winner) {
        side[winner].matchesWon++;
        // В плей-офф победитель выходит в следующий раунд, очков не получает.
        if (!m.playoff) side[winner].points += 2;
      }
    });

    var override = season.pointsOverride;
    if (override && typeof override === "object") {
      order.forEach(function (id) {
        var v = override[id];
        rows[id].points = typeof v === "number" ? v : 0;
      });
    }

    return order.map(function (id) { return rows[id]; }).sort(function (a, b) {
      return (b.points - a.points) ||
        ((b.goalsFor - b.goalsAgainst) - (a.goalsFor - a.goalsAgainst)) ||
        (b.goalsFor - a.goalsFor) ||
        a.name.localeCompare(b.name, "ru");
    });
  }

  /* ---------- Вывод: общие кусочки ---------- */

  function el(tag, attrs, children) { return KB.el(tag, attrs, children); }

  function clear(node) { while (node.firstChild) node.removeChild(node.firstChild); }

  function initials(name) {
    var words = String(name).split(/[\s-]+/).filter(Boolean);
    return words.slice(0, 2).map(function (w) { return w.charAt(0).toUpperCase(); }).join("") || "?";
  }

  // Эмблема команды: SVG из данных или кружок с инициалами (.team-mark).
  function teamBadge(team, size) {
    size = size || 32;
    var name = team ? team.name : "";
    if (team && team.logo) {
      return el("img", { class: "team-logo", src: team.logo, alt: "", width: size, height: size });
    }
    return el("span", { class: "team-mark team-mark--sm", "aria-hidden": "true",
      style: "width:" + size + "px;height:" + size + "px;font-size:" + Math.max(10, Math.round(size / 3)) + "px" },
      initials(name || "?"));
  }

  function teamOf(season, id) {
    return teamIndex(season)[id] || { id: id, name: String(id), logo: null };
  }

  function formatDate(iso, withWeekday) {
    var p = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso || "");
    if (!p) return iso ? String(iso) : "дата уточняется";
    var d = new Date(Date.UTC(+p[1], +p[2] - 1, +p[3]));
    var text = (+p[3]) + " " + MONTHS[+p[2] - 1] + " " + p[1];
    return withWeekday ? text + ", " + WEEKDAYS[d.getUTCDay()] : text;
  }

  function scoreText(s) { return s.home + " : " + s.away; }

  /* ---------- Переключатель сезонов ---------- */

  function renderSeasonSwitch(container, seasons, current, onChange) {
    clear(container);
    var keys = Object.keys(seasons || {}).sort();
    var group = el("div", { class: "season-switch", role: "group", "aria-label": "Выбор сезона" });
    keys.forEach(function (key) {
      var btn = el("button", {
        type: "button", class: "season-switch__btn",
        "aria-pressed": key === current ? "true" : "false",
        dataset: { season: key },
        onclick: function () {
          Array.prototype.forEach.call(group.querySelectorAll("button"), function (b) {
            b.setAttribute("aria-pressed", b === btn ? "true" : "false");
          });
          if (onChange) onChange(key);
        }
      }, seasons[key].title || ("Сезон " + key));
      group.appendChild(btn);
    });
    container.appendChild(group);
    return group;
  }

  // Переключатель + область вывода; сезон запоминается в адресе (#2027).
  function initSeasonView(switchContainer, viewContainer, render) {
    var data = root && root.SITE_DATA;
    if (!data || !data.seasons) return;
    var fromHash = (root.location && root.location.hash || "").replace("#", "");
    var current = data.seasons[fromHash] ? fromHash : (data.currentSeason || Object.keys(data.seasons)[0]);
    function show(key) {
      clear(viewContainer);
      render(viewContainer, data.seasons[key], key);
      viewContainer.setAttribute("data-season", key);
    }
    renderSeasonSwitch(switchContainer, data.seasons, current, function (key) {
      show(key);
      if (root.history && root.history.replaceState) {
        try { root.history.replaceState(null, "", "#" + key); } catch (e) { /* file:// в некоторых браузерах */ }
      }
    });
    show(current);
  }

  /* ---------- Календарь ---------- */

  function breakdownList(m, season) {
    var items = [];
    var home = teamName(season, m.home);
    var away = teamName(season, m.away);
    if (m.keeperbattle === "home" || m.keeperbattle === "away") {
      var kbName = m.keeperbattle === "home" ? home : away;
      items.push(["Кипербатл", kbName + (m.playoff ? " (фора 1 мяч)" : " (+1 очко)")]);
    }
    if (isScore(m.main)) items.push(["Основной матч", scoreText(m.main)]);
    if (isScore(m.penalties)) items.push(["Серия пенальти", scoreText(m.penalties)]);
    var w = matchWinner(m);
    if (w) items.push(["Победа в матче", (w === "home" ? home : away) + (m.playoff ? " (выход дальше)" : " (+2 очка)")]);
    return items;
  }

  function matchCard(m, season) {
    var home = teamOf(season, m.home);
    var away = teamOf(season, m.away);
    var score = finalScore(m);
    var detailed = hasBreakdown(m);
    var when = [m.round != null ? "Тур " + m.round : null, m.time].filter(Boolean).join(" · ") || formatDate(m.date, true);

    var scoreBox = el("div", { class: "match__score" }, score
      ? [el("span", { class: "match__goals", "aria-label": "Счёт " + score.home + ":" + score.away }, scoreText(score)),
         el("span", { class: "match__score-label" }, detailed ? "итог" : "как на nml.su")]
      : [el("span", { class: "match__goals match__goals--none" }, "—"),
         el("span", { class: "match__score-label" }, "не сыгран")]);

    var children = [
      el("p", { class: "match__when" }, when),
      el("div", { class: "match__teams" }, [
        el("div", { class: "match__team match__team--home" }, [teamBadge(home, 40), el("span", { class: "match__name" }, home.name)]),
        scoreBox,
        el("div", { class: "match__team match__team--away" }, [teamBadge(away, 40), el("span", { class: "match__name" }, away.name)])
      ])
    ];
    if (m.venue) children.push(el("p", { class: "match__venue" }, m.venue));
    if (detailed) {
      children.push(el("dl", { class: "match__breakdown" }, breakdownList(m, season).map(function (it) {
        return el("div", null, [el("dt", null, it[0]), el("dd", null, it[1])]);
      })));
    } else if (score) {
      children.push(el("p", { class: "match__pending" }, "Кипербатл, основной матч и серия пенальти — " + PENDING_TEXT));
    }
    return el("li", { class: "match" }, el("article", null, children));
  }

  function renderCalendar(container, season) {
    clear(container);
    season = season || {};
    var matches = (season.matches || []).slice();
    if (!matches.length) {
      container.appendChild(el("div", { class: "empty-state" }, [
        el("strong", null, "Матчей пока нет"),
        season.note || "Расписание матчей появится позже"
      ]));
      return;
    }
    matches.sort(function (a, b) {
      return String(a.date).localeCompare(String(b.date)) || String(a.time || "").localeCompare(String(b.time || ""));
    });
    var groups = [];
    matches.forEach(function (m) {
      var key = (m.stage || "") + "|" + (m.date || "");
      var g = groups[groups.length - 1];
      if (!g || g.key !== key) groups.push(g = { key: key, stage: m.stage, date: m.date, items: [] });
      g.items.push(m);
    });
    groups.forEach(function (g) {
      var title = [g.stage, g.date ? formatDate(g.date, true) : null].filter(Boolean).join(" · ") || "Матчи";
      container.appendChild(el("section", { class: "calendar-round" }, [
        el("h3", { class: "calendar-round__title" }, title),
        el("ol", { class: "match-list" }, g.items.map(function (m) { return matchCard(m, season); }))
      ]));
    });
    if (season.note) container.appendChild(el("p", { class: "calendar-next" }, season.note));
    if (season.source) {
      container.appendChild(el("p", { class: "note note--plain" }, [
        "Счёт — как опубликован на странице турнира: ",
        el("a", { href: season.source, target: "_blank", rel: "noopener" }, "nml.su"),
        ". Где разбивка на кипербатл, основной матч и серию пенальти не опубликована, стоит пометка «" + PENDING_TEXT + "»."
      ]));
    }
  }

  /* ---------- Таблица ---------- */

  function winsCell(row, value) {
    if (row.played > 0 && row.unconfirmed === row.played) {
      return el("td", { class: "num muted", title: PENDING_TEXT }, [
        el("span", { "aria-hidden": "true" }, "—"), el("span", { class: "visually-hidden" }, PENDING_TEXT)
      ]);
    }
    return el("td", { class: "num" }, String(value) + (row.unconfirmed > 0 ? "*" : ""));
  }

  function renderStandings(container, rows, season, options) {
    clear(container);
    season = season || {};
    options = options || {};
    var override = !!(season.pointsOverride && typeof season.pointsOverride === "object");
    var started = (season.matches || []).length > 0;

    var head = el("tr", null, [
      el("th", { scope: "col", class: "num" }, "#"),
      el("th", { scope: "col" }, "Команда"),
      el("th", { scope: "col", class: "num" }, el("abbr", { title: "Игры" }, "И")),
      el("th", { scope: "col", class: "num" }, "Батлы"),
      el("th", { scope: "col", class: "num" }, "Матчи"),
      el("th", { scope: "col", class: "num" }, "Мячи"),
      el("th", { scope: "col", class: "num" }, el("abbr", { title: "Очки" }, "О"))
    ]);
    var body = (rows || []).map(function (r, i) {
      var team = teamOf(season, r.teamId);
      return el("tr", null, [
        el("td", { class: "num standings__pos" }, String(i + 1)),
        el("th", { scope: "row", class: "standings__team" }, [teamBadge({ name: r.name, logo: r.logo || team.logo }, 28), el("span", null, r.name)]),
        el("td", { class: "num" }, String(r.played)),
        winsCell(r, r.battlesWon),
        winsCell(r, r.matchesWon),
        el("td", { class: "num nowrap" }, r.goalsFor + "–" + r.goalsAgainst),
        el("td", { class: "num standings__points" }, String(r.points) + (override ? "*" : ""))
      ]);
    });

    container.appendChild(el("div", { class: "table-scroll" },
      el("table", { class: "table standings" }, [
        el("caption", { class: "visually-hidden" }, "Турнирная таблица — " + (season.title || "")),
        el("thead", null, head),
        el("tbody", null, body)
      ])));

    if (override) {
      container.appendChild(el("p", { class: "note" }, season.overrideNote || "Очки — по итогам организатора"));
    }
    if (!started) {
      container.appendChild(el("p", { class: "standings__empty" }, options.emptyNote || season.note || "Сезон ещё не начался"));
    }
    container.appendChild(el("p", { class: "note note--plain standings__legend" },
      "И — игры; Батлы — победы в кипербатле; Матчи — победы в матче (футбольный матч и серия пенальти); " +
      "Мячи — забитые и пропущенные; О — очки. За кипербатл — 1 очко (в плей-офф вместо очка — фора в один мяч), " +
      "за матч — 2 очка; ничьих нет. При равенстве очков выше команда с лучшей разницей мячей, затем — с большим числом забитых."));
  }

  /* ---------- Состав команды ---------- */

  function sortPlayers(players) {
    return (players || []).slice().sort(function (a, b) {
      return (b.goalkeeper ? 1 : 0) - (a.goalkeeper ? 1 : 0) ||
        ((a.number == null ? Infinity : a.number) - (b.number == null ? Infinity : b.number)) ||
        String(a.name).localeCompare(String(b.name), "ru");
    });
  }

  function plural(n, one, few, many) {
    var m10 = n % 10, m100 = n % 100;
    if (m10 === 1 && m100 !== 11) return one;
    if (m10 >= 2 && m10 <= 4 && (m100 < 12 || m100 > 14)) return few;
    return many;
  }

  function renderRoster(container, team) {
    clear(container);
    if (!team) return;
    var players = sortPlayers(team.players);
    var withNumbers = players.some(function (p) { return p.number != null; });
    var withKeepers = players.some(function (p) { return p.goalkeeper; });

    var rows = players.map(function (p) {
      var cells = [];
      if (withNumbers) cells.push(el("td", { class: "num roster__num" }, p.number == null ? "" : String(p.number)));
      cells.push(el("td", { class: "roster__name" }, [
        p.name,
        p.goalkeeper ? el("span", { class: "roster__gk" }, "вратарь") : null
      ]));
      return el("tr", null, cells);
    });
    var headCells = [];
    if (withNumbers) headCells.push(el("th", { scope: "col", class: "num" }, "№"));
    headCells.push(el("th", { scope: "col" }, "Игрок"));

    var notes = [];
    if (!withNumbers) notes.push("номера");
    if (!withKeepers) notes.push("амплуа");

    container.appendChild(el("article", { class: "card team-card", id: "team-" + team.id }, [
      el("header", { class: "team-card__head" }, [
        team.logo ? el("img", { class: "team-card__logo", src: team.logo, alt: "Эмблема команды «" + team.name + "»", width: 112, height: 112 })
          : teamBadge(team, 112),
        el("div", null, [
          el("h2", { class: "team-card__name" }, team.name),
          team.city ? el("p", { class: "team-card__city" }, team.city) : null,
          el("p", { class: "team-card__count" }, players.length + " " + plural(players.length, "игрок", "игрока", "игроков") + " в заявке")
        ])
      ]),
      players.length
        ? el("table", { class: "table roster" + (withNumbers ? "" : " roster--no-numbers") }, [
            el("caption", { class: "visually-hidden" }, "Состав команды «" + team.name + "»"),
            el("thead", null, el("tr", null, headCells)),
            el("tbody", null, rows)
          ])
        : el("p", { class: "muted" }, "Состав будет объявлен"),
      notes.length && players.length
        ? el("p", { class: "note note--plain" }, "В заявке на nml.su не указаны " + notes.join(" и ") + ".")
        : null
    ]));
  }

  /* ---------- Блок «Сезон сейчас» (Главная, Турнир) ---------- */

  // options: { note: true, links: true } — показывать строку о следующих играх и кнопки.
  function renderSeasonSummary(container, season, options) {
    if (!container || !season) return;
    options = options || {};
    clear(container);
    var rows = computeStandings(season);
    var leader = rows[0];
    var played = (season.matches || []).filter(function (m) { return !!finalScore(m); });
    var children = [];

    if (leader && (leader.points > 0 || leader.played > 0)) {
      children.push(el("div", { class: "card", style: "flex-direction:row;align-items:center;gap:16px;margin-bottom:16px" }, [
        teamBadge({ name: leader.name, logo: leader.logo }, 64),
        el("div", { class: "stat" }, [
          el("span", { class: "stat__label" }, "Лидер сезона"),
          el("span", { class: "stat__value", style: "font-size:clamp(22px,3vw,32px)" }, leader.name),
          el("span", { class: "stat__label" }, leader.points + " " + plural(leader.points, "очко", "очка", "очков") +
            (season.pointsOverride ? " — по итогам организатора" : ""))
        ])
      ]));
    }
    if (played.length) {
      children.push(el("ul", { class: "grid grid--3", style: "list-style:none;padding:0;margin:0" }, played.slice(-3).map(function (m) {
        var s = finalScore(m);
        var home = teamOf(season, m.home), away = teamOf(season, m.away);
        return el("li", { class: "card" }, [
          el("p", { class: "eyebrow" }, [formatDate(m.date), m.time].filter(Boolean).join(" · ")),
          el("p", { class: "card__title", style: "display:flex;flex-wrap:wrap;align-items:center;gap:8px" }, [
            teamBadge(home, 28), home.name,
            el("strong", { class: "copper nowrap" }, scoreText(s)),
            away.name, teamBadge(away, 28)
          ]),
          el("p", { class: "card__text" }, hasBreakdown(m) ? "Итог с серией пенальти" : "Счёт как на nml.su · " + PENDING_TEXT)
        ]);
      })));
    }
    if (season.note && options.note !== false) children.push(el("p", { class: "lead", style: "margin-top:20px" }, season.note));
    if (options.links !== false) children.push(el("p", { class: "section__more" }, [
      el("a", { class: "btn btn--primary", href: "tablitsa.html" }, "Таблица сезона"), " ",
      el("a", { class: "btn btn--ghost", href: "kalendar.html" }, "Календарь"), " ",
      el("a", { class: "btn btn--ghost", href: "komandy.html" }, "Команды")
    ]));
    children.forEach(function (c) { container.appendChild(c); });
  }

  /* ---------- Экспорт ---------- */

  KB.computeStandings = computeStandings;
  KB.renderSeasonSwitch = renderSeasonSwitch;
  KB.initSeasonView = initSeasonView;
  KB.renderCalendar = renderCalendar;
  KB.renderStandings = renderStandings;
  KB.renderRoster = renderRoster;
  KB.renderSeasonSummary = renderSeasonSummary;
  KB.teamBadge = teamBadge;

  if (typeof module !== "undefined" && module.exports) {
    module.exports = { computeStandings: computeStandings };
  }
})(typeof window !== "undefined" ? window : null);
