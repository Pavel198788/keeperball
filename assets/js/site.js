/*
  Общее поведение сайта: мобильное меню, контакты из data/site-data.js,
  мини-хелпер KB.el для создания DOM. Подключается на каждой странице
  после data/site-data.js (если он подключён).
*/
(function () {
  "use strict";

  var root = document.documentElement;
  root.classList.add("js");

  /* ---------- KB.el(tag, attrs, children) ---------- */
  function el(tag, attrs, children) {
    var node = document.createElement(tag);
    if (attrs) {
      Object.keys(attrs).forEach(function (key) {
        var value = attrs[key];
        if (value === null || value === undefined || value === false) return;
        if (key === "class" || key === "className") node.className = value;
        else if (key === "text") node.textContent = value;
        else if (key === "html") node.innerHTML = value;
        else if (key === "dataset") Object.keys(value).forEach(function (d) { node.dataset[d] = value[d]; });
        else if (key.slice(0, 2) === "on" && typeof value === "function") node.addEventListener(key.slice(2).toLowerCase(), value);
        else node.setAttribute(key, value === true ? "" : String(value));
      });
    }
    appendChildren(node, children);
    return node;
  }

  function appendChildren(node, children) {
    if (children === null || children === undefined || children === false) return;
    if (!Array.isArray(children)) children = [children];
    children.forEach(function (child) {
      if (child === null || child === undefined || child === false) return;
      if (Array.isArray(child)) appendChildren(node, child);
      else if (typeof child === "string" || typeof child === "number") node.appendChild(document.createTextNode(String(child)));
      else node.appendChild(child);
    });
  }

  window.KB = window.KB || {};
  window.KB.el = el;

  /* ---------- Мобильное меню ---------- */
  function initNav() {
    var toggle = document.querySelector(".site-nav__toggle");
    var nav = document.querySelector(".site-nav");
    if (!toggle || !nav) return;

    function setOpen(open) {
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
      nav.classList.toggle("is-open", open);
    }

    toggle.addEventListener("click", function () {
      setOpen(toggle.getAttribute("aria-expanded") !== "true");
    });
    document.addEventListener("keydown", function (event) {
      if (event.key === "Escape" && toggle.getAttribute("aria-expanded") === "true") {
        setOpen(false);
        toggle.focus();
      }
    });
    nav.addEventListener("click", function (event) {
      if (event.target.closest("a")) setOpen(false);
    });
  }

  /* ---------- Контакты ---------- */
  function isPlaceholder(value) {
    return /^\s*\[.*\]\s*$/.test(value);
  }

  function contactHref(kind, value) {
    if (kind === "email") return "mailto:" + value.trim();
    if (kind === "phone") return "tel:" + value.replace(/[^\d+]/g, "");
    if (kind === "social" && /^https?:\/\//i.test(value.trim())) return value.trim();
    if (kind === "social" && /^@/.test(value.trim())) return "https://t.me/" + value.trim().slice(1);
    return null;
  }

  function initContacts() {
    var data = window.SITE_DATA;
    if (!data || !data.contacts) return;
    var nodes = document.querySelectorAll("[data-contact]");
    Array.prototype.forEach.call(nodes, function (node) {
      var kind = node.getAttribute("data-contact");
      var value = data.contacts[kind];
      if (typeof value !== "string" || value.trim() === "") return;
      node.textContent = value;
      if (isPlaceholder(value)) {
        node.classList.add("placeholder");
        if (node.tagName === "A") node.removeAttribute("href");
        return;
      }
      node.classList.remove("placeholder");
      var href = contactHref(kind, value);
      if (node.tagName === "A" && href) node.setAttribute("href", href);
    });
  }

  function init() {
    initNav();
    initContacts();
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();
