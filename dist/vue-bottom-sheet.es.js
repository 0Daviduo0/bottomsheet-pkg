import { ref as r, computed as V, watch as S, nextTick as C, onMounted as se, onUnmounted as re, resolveComponent as ue, createElementBlock as f, openBlock as c, createVNode as G, createElementVNode as q, Transition as K, withCtx as $, createCommentVNode as z, normalizeStyle as ie, normalizeClass as F, Fragment as J, renderList as Q, createBlock as I, resolveDynamicComponent as W, mergeProps as X, withModifiers as ce, renderSlot as de } from "vue";
import { useRoute as ve } from "vue-router";
const fe = (w, g) => {
  const t = w.__vccOpts || w;
  for (const [u, P] of g)
    t[u] = P;
  return t;
}, me = { class: "lg:hidden" }, he = ["href"], pe = ["href", "onClick"], be = 5, j = "--bottom-sheet-peek-height", ge = {
  __name: "BottomSheet",
  props: {
    modelValue: Boolean,
    middleY: { type: Number, default: 50 },
    fullY: { type: Number, default: 5 },
    quickLinks: { type: Object }
  },
  emits: ["update:modelValue", "state-change", "handle-click"],
  setup(w, { emit: g }) {
    const t = w, u = g;
    ve();
    const P = r(!1), H = r(""), Z = r(null), ee = r(null), m = r(null), M = r(null), h = r(!1), x = r(!1), B = r(0), Y = r(100), l = r(100), k = r(0), L = r(0), n = r(100), te = V(() => k.value > 0 ? k.value + L.value : 0);
    S(m, async (e) => {
      e && (await C(), k.value = e.offsetHeight);
    }, { immediate: !0 });
    const ae = V(() => {
      const e = window.innerHeight;
      if (!e || k.value <= 0)
        return -1;
      const a = k.value / e * 100, s = (L.value || 0) / e * 100;
      return a + s;
    });
    S(ae, (e) => {
      if (e >= 0) {
        const a = Math.max(0, 100 - e);
        if (Math.abs(a - n.value) > 0.1) {
          const s = n.value;
          n.value = a, Math.abs(l.value - s) < 1 && (l.value = n.value), Math.abs(Y.value - s) < 1 && !x.value && (Y.value = n.value);
        }
      }
    }), V(() => [
      n.value,
      t.middleY,
      t.fullY
    ].sort((e, a) => a - e));
    const le = V(() => ({
      top: `${l.value}vh`,
      position: "fixed",
      left: "0",
      right: "0",
      bottom: "0",
      transition: h.value ? "none" : "top 0.3s ease-out",
      maxHeight: `calc(100vh - ${t.fullY}vh)`
    })), y = V(() => n.value < 100 && Math.abs(l.value - n.value) < 1);
    S(y, async (e) => {
      if (e && (await C(), M.value)) {
        const a = M.value.offsetHeight;
        a > 0 && L.value !== a && (L.value = a);
      }
    }, { immediate: !0 }), S([te, y], ([e, a]) => {
      a && e > 0 ? document.documentElement.style.setProperty(j, `${e}px`) : document.documentElement.style.setProperty(j, "0px");
    }, { immediate: !0, deep: !0 });
    const ne = (e) => {
      m.value && !m.value.contains(e.target) || (e.preventDefault(), e.stopPropagation(), x.value = !0, h.value = !1, B.value = e.clientY, Y.value = l.value, window.addEventListener("pointermove", N, { passive: !1 }), window.addEventListener("pointerup", _), window.addEventListener("pointerleave", _));
    }, N = (e) => {
      if (!x.value) return;
      const a = e.clientY, s = Math.abs(a - B.value);
      if (!h.value && s > be && (h.value = !0, document.body.style.cursor = "grabbing", document.body.style.userSelect = "none"), h.value) {
        e.preventDefault();
        const i = a - B.value, p = window.innerHeight;
        if (p === 0) return;
        const o = i / p * 100;
        let d = Y.value + o;
        const b = n.value < 100 ? n.value : t.middleY;
        d = Math.max(t.fullY, Math.min(b, d)), l.value = d;
      }
    }, _ = (e) => {
      if (!x.value) return;
      const a = 1, s = Math.abs(Y.value - n.value) < a;
      if (h.value) {
        h.value = !1, document.body.style.cursor = "", document.body.style.userSelect = "";
        const i = l.value, p = Y.value, o = n.value, d = t.middleY, b = t.fullY;
        let v;
        const T = i < p;
        if (s && T)
          if (i > d - a)
            v = d;
          else {
            const U = Math.abs(i - d);
            v = Math.abs(i - b) < U ? b : d;
          }
        else
          v = [o, d, b].filter((E) => E <= 100).reduce((E, A) => Math.abs(A - i) < Math.abs(E - i) ? A : E);
        l.value = v;
        let D = "peek", R = !1;
        Math.abs(v - d) < a ? (D = "middle", R = !0) : Math.abs(v - b) < a && (D = "full", R = !0), t.modelValue !== R && u("update:modelValue", R), u("state-change", D, v);
      } else
        s && (u("handle-click"), l.value = t.middleY, t.modelValue || u("update:modelValue", !0), u("state-change", "middle", t.middleY));
      x.value = !1, window.removeEventListener("pointermove", N), window.removeEventListener("pointerup", _), window.removeEventListener("pointerleave", _);
    }, oe = () => {
      l.value !== n.value && (l.value = n.value, t.modelValue && u("update:modelValue", !1), u("state-change", "peek", n.value));
    };
    se(async () => {
      H.value = navigator.userAgent.toLowerCase(), P.value = /ipad/.test(H.value) && /safari/.test(H.value) && !/chrome/.test(H.value), m.value && (await C(), k.value = m.value.offsetHeight), setTimeout(() => {
        const e = n.value;
        t.modelValue ? (Math.abs(l.value - e) < 1 || l.value >= 100) && (l.value = t.middleY, u("state-change", "middle", t.middleY)) : Math.abs(l.value - e) > 0.1 && (l.value = e, u("state-change", "peek", e));
      }, 0), window.addEventListener("resize", O);
    }), re(() => {
      window.removeEventListener("pointermove", N), window.removeEventListener("pointerup", _), window.removeEventListener("pointerleave", _), window.removeEventListener("resize", O), document.body.style.cursor = "", document.body.style.userSelect = "", document.documentElement.style.removeProperty(j);
    });
    const O = async () => {
      m.value && (await C(), k.value = m.value.offsetHeight), y.value && M.value ? (await C(), L.value = M.value.offsetHeight) : y.value;
    };
    return S(() => t.modelValue, (e) => {
      if (h.value || x.value) return;
      const a = l.value, s = 1, i = Math.abs(a - t.middleY) < s || Math.abs(a - t.fullY) < s, p = Math.abs(a - n.value) < s;
      e && !i ? (l.value = t.middleY, u("state-change", "middle", t.middleY)) : !e && !p && (l.value = n.value, u("state-change", "peek", n.value));
    }), (e, a) => {
      const s = ue("router-link");
      return c(), f("div", me, [
        G(K, { name: "fade" }, {
          default: $(() => [
            y.value ? z("", !0) : (c(), f("div", {
              key: 0,
              class: "fixed inset-0 z-40 bg-gray-900/60 pointer-events-auto",
              onClick: oe
            }))
          ]),
          _: 1
        }),
        q("div", {
          ref_key: "sheetRef",
          ref: Z,
          class: "fixed bottom-0 left-0 right-0 bg-white rounded-t-xl shadow-2xl flex flex-col pointer-events-auto overflow-hidden touch-pan-y z-50",
          style: ie(le.value)
        }, [
          q("div", {
            ref_key: "handleRef",
            ref: m,
            class: "py-3 flex justify-center items-center cursor-grab active:cursor-grabbing touch-none flex-shrink-0",
            onPointerdown: ne
          }, a[0] || (a[0] = [
            q("div", { class: "w-10 h-1.5 bg-gray-300 rounded-full pointer-events-none" }, null, -1)
          ]), 544),
          y.value ? (c(), f("div", {
            key: 0,
            ref_key: "quickLinksRef",
            ref: M,
            class: F(["px-4", "pt-3", t.quickLinks ? "" : " p-12 ", P.value && t.quickLinks ? " pb-24 border-t border-gray-200 " : "", !P.value && t.quickLinks ? " pb-14 border-t border-gray-200 " : ""])
          }, [
            (c(!0), f(J, null, Q(t.quickLinks, (i, p) => (c(), f("div", {
              key: `mobile-sheet-section-${p}`,
              class: "flex justify-around"
            }, [
              (c(!0), f(J, null, Q(i.items, (o, d) => (c(), f("div", null, [
                o.href ? (c(), f("a", {
                  key: 0,
                  href: o.href,
                  class: F([o.current ? "bg-gray-100/60 text-urbis-blue" : "text-gray-700 hover:bg-gray-50 hover:text-urbis-blue", "group flex gap-x-3 rounded-md p-2 text-sm/6 font-semibold"])
                }, [
                  (c(), I(W(o.icon), X({ ref_for: !0 }, o.iconProps, {
                    class: ["size-6 shrink-0", o.iconProps ? "" : o.current ? "text-urbis-blue" : "text-gray-400 group-hover:text-urbis-blue"],
                    "aria-hidden": "true"
                  }), null, 16, ["class"]))
                ], 10, he)) : o.to ? (c(), I(s, {
                  key: 1,
                  to: o.to,
                  custom: ""
                }, {
                  default: $(({ href: b, navigate: v, isActive: T }) => [
                    q("a", {
                      href: b,
                      onClick: ce(() => {
                        v();
                      }, ["prevent"]),
                      class: F([T ? "bg-gray-100/60 text-urbis-blue" : "text-gray-700 hover:bg-gray-50 hover:text-urbis-blue", "group flex gap-x-3 rounded-md p-2 text-sm/6 font-semibold"])
                    }, [
                      (c(), I(W(o.icon), X({ ref_for: !0 }, o.iconProps, {
                        class: ["size-6 shrink-0", o.iconProps ? "" : T ? "text-urbis-blue" : "text-gray-400 group-hover:text-urbis-blue"],
                        "aria-hidden": "true"
                      }), null, 16, ["class"]))
                    ], 10, pe)
                  ]),
                  _: 2
                }, 1032, ["to"])) : z("", !0)
              ]))), 256))
            ]))), 128))
          ], 2)) : z("", !0),
          G(K, { name: "fade" }, {
            default: $(() => [
              y.value ? z("", !0) : (c(), f("div", {
                key: 0,
                ref_key: "contentRef",
                ref: ee,
                class: "flex-1 overflow-y-auto px-4 pb-4 min-h-[0]"
              }, [
                de(e.$slots, "default", {}, void 0, !0)
              ], 512))
            ]),
            _: 3
          })
        ], 4)
      ]);
    };
  }
}, ke = /* @__PURE__ */ fe(ge, [["__scopeId", "data-v-b74b4e06"]]), xe = {
  install: (w, g) => {
    const t = (g == null ? void 0 : g.componentName) || "BottomSheet";
    w.component(t, ke);
  }
};
export {
  ke as BottomSheet,
  xe as default
};
