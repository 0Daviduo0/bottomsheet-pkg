import { ref as i, computed as V, watch as S, nextTick as H, onMounted as se, onUnmounted as ue, resolveComponent as re, createElementBlock as m, openBlock as v, createVNode as G, createElementVNode as q, Transition as K, withCtx as F, createCommentVNode as z, normalizeStyle as ie, normalizeClass as j, Fragment as J, renderList as Q, createBlock as I, resolveDynamicComponent as W, mergeProps as X, withModifiers as ce, renderSlot as de } from "vue";
import { useRoute as ve } from "vue-router";
const fe = (x, k) => {
  const t = x.__vccOpts || x;
  for (const [u, M] of k)
    t[u] = M;
  return t;
}, he = { class: "lg:hidden" }, me = ["href"], pe = ["href", "onClick"], ge = 5, O = "--bottom-sheet-peek-height", be = {
  __name: "BottomSheet",
  props: {
    modelValue: Boolean,
    middleY: { type: Number, default: 50 },
    fullY: { type: Number, default: 5 },
    quickLinks: { type: Object }
  },
  emits: ["update:modelValue", "state-change", "handle-click"],
  setup(x, { emit: k }) {
    const t = x, u = k;
    ve();
    const M = i(!1), C = i(""), Z = i(null), ee = i(null), p = i(null), L = i(null), g = i(!1), Y = i(!1), B = i(0), P = i(100), l = i(100), y = i(0), c = i(0), o = i(100), te = V(() => y.value > 0 ? y.value + c.value : 0);
    S(p, async (e) => {
      e && (await H(), y.value = e.offsetHeight);
    });
    const ae = V(() => {
      const e = window.innerHeight;
      if (!e || y.value <= 0)
        return -1;
      const a = y.value / e * 100, r = (c.value || 0) / e * 100;
      return a + r;
    });
    S(ae, (e) => {
      if (e >= 0) {
        const a = Math.max(0, 100 - e);
        if (Math.abs(a - o.value) > 0.1) {
          const r = o.value;
          o.value = a, Math.abs(l.value - r) < 1 && (l.value = o.value), Math.abs(P.value - r) < 1 && !Y.value && (P.value = o.value);
        }
      }
    }), V(() => [
      o.value,
      t.middleY,
      t.fullY
    ].sort((e, a) => a - e));
    const le = V(() => ({
      top: `${l.value}vh`,
      position: "fixed",
      left: "0",
      right: "0",
      bottom: "0",
      transition: g.value ? "none" : "top 0.3s ease-out",
      maxHeight: `calc(100vh - ${t.fullY}vh)`
    })), w = V(() => o.value < 100 && Math.abs(l.value - o.value) < 1);
    S(w, async (e) => {
      if (e)
        if (await H(), L.value) {
          const a = L.value.offsetHeight;
          c.value !== a && (c.value = a);
        } else
          c.value !== 0 && (c.value = 0);
      else
        c.value !== 0 && (c.value = 0);
    }, { immediate: !0 }), S([te, w], ([e, a]) => {
      a && e > 0 ? document.documentElement.style.setProperty(O, `${e}px`) : document.documentElement.style.setProperty(O, "0px");
    }, { immediate: !0 });
    const ne = (e) => {
      p.value && !p.value.contains(e.target) || (e.preventDefault(), e.stopPropagation(), Y.value = !0, g.value = !1, B.value = e.clientY, P.value = l.value, window.addEventListener("pointermove", N, { passive: !1 }), window.addEventListener("pointerup", _), window.addEventListener("pointerleave", _));
    }, N = (e) => {
      if (!Y.value) return;
      const a = e.clientY, r = Math.abs(a - B.value);
      if (!g.value && r > ge && (g.value = !0, document.body.style.cursor = "grabbing", document.body.style.userSelect = "none"), g.value) {
        e.preventDefault();
        const s = a - B.value, h = window.innerHeight;
        if (h === 0) return;
        const n = s / h * 100;
        let d = P.value + n;
        const b = o.value < 100 ? o.value : t.middleY;
        d = Math.max(t.fullY, Math.min(b, d)), l.value = d;
      }
    }, _ = (e) => {
      if (!Y.value) return;
      const a = 1, r = Math.abs(P.value - o.value) < a;
      if (g.value) {
        g.value = !1, document.body.style.cursor = "", document.body.style.userSelect = "";
        const s = l.value, h = P.value, n = o.value, d = t.middleY, b = t.fullY;
        let f;
        const T = s < h;
        if (r && T)
          if (s > d - a)
            f = d;
          else {
            const E = Math.abs(s - d);
            f = Math.abs(s - b) < E ? b : d;
          }
        else {
          const E = [d, b];
          n < 100 && E.push(n), E.length === 0 ? f = h : f = E.reduce(($, A) => Math.abs(A - s) < Math.abs($ - s) ? A : $);
        }
        l.value = f;
        let D = "peek", R = !1;
        Math.abs(f - d) < a ? (D = "middle", R = !0) : Math.abs(f - b) < a && (D = "full", R = !0), t.modelValue !== R && u("update:modelValue", R), u("state-change", D, f);
      } else
        r && (u("handle-click"), l.value = t.middleY, t.modelValue || u("update:modelValue", !0), u("state-change", "middle", t.middleY));
      Y.value = !1, window.removeEventListener("pointermove", N), window.removeEventListener("pointerup", _), window.removeEventListener("pointerleave", _);
    }, oe = () => {
      l.value !== o.value && o.value < 100 && (l.value = o.value, t.modelValue && u("update:modelValue", !1), u("state-change", "peek", o.value));
    };
    se(async () => {
      C.value = navigator.userAgent.toLowerCase(), M.value = /ipad/.test(C.value) && /safari/.test(C.value) && !/chrome/.test(C.value), p.value && (await H(), y.value = p.value.offsetHeight), setTimeout(() => {
        const e = o.value;
        t.modelValue ? (Math.abs(l.value - e) < 1 || l.value >= 100) && (l.value = t.middleY, u("state-change", "middle", t.middleY)) : e < 100 && Math.abs(l.value - e) > 0.1 ? (l.value = e, u("state-change", "peek", e)) : e >= 100 && l.value < 100 && (l.value = 100, u("state-change", "hidden", 100));
      }, 0), window.addEventListener("resize", U);
    }), ue(() => {
      window.removeEventListener("pointermove", N), window.removeEventListener("pointerup", _), window.removeEventListener("pointerleave", _), window.removeEventListener("resize", U), document.body.style.cursor = "", document.body.style.userSelect = "", document.documentElement.style.removeProperty(O);
    });
    const U = async () => {
      if (p.value && (await H(), y.value = p.value.offsetHeight), w.value && L.value) {
        await H();
        const e = L.value.offsetHeight;
        c.value !== e && (c.value = e);
      } else w.value || c.value !== 0 && (c.value = 0);
    };
    return S(() => t.modelValue, (e) => {
      if (g.value || Y.value) return;
      const a = l.value, r = 1, s = o.value, h = Math.abs(a - t.middleY) < r || Math.abs(a - t.fullY) < r, n = s < 100 && Math.abs(a - s) < r;
      e && !h ? (l.value = t.middleY, u("state-change", "middle", t.middleY)) : !e && !n && (s < 100 ? (l.value = s, u("state-change", "peek", s)) : (l.value = 100, u("state-change", "hidden", 100)));
    }), (e, a) => {
      const r = re("router-link");
      return v(), m("div", he, [
        G(K, { name: "fade" }, {
          default: F(() => [
            w.value ? z("", !0) : (v(), m("div", {
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
            ref: p,
            class: "py-3 flex justify-center items-center cursor-grab active:cursor-grabbing touch-none flex-shrink-0",
            onPointerdown: ne
          }, a[0] || (a[0] = [
            q("div", { class: "w-10 h-1.5 bg-gray-300 rounded-full pointer-events-none" }, null, -1)
          ]), 544),
          w.value ? (v(), m("div", {
            key: 0,
            ref_key: "quickLinksRef",
            ref: L,
            class: j(["px-4", "pt-3", t.quickLinks ? "" : " p-12 ", M.value && t.quickLinks ? " pb-24 border-t border-gray-200 " : "", !M.value && t.quickLinks ? " pb-14 border-t border-gray-200 " : ""])
          }, [
            (v(!0), m(J, null, Q(t.quickLinks, (s, h) => (v(), m("div", {
              key: `mobile-sheet-section-${h}`,
              class: "flex justify-around"
            }, [
              (v(!0), m(J, null, Q(s.items, (n, d) => (v(), m("div", { key: d }, [
                n.href ? (v(), m("a", {
                  key: 0,
                  href: n.href,
                  class: j([n.current ? "bg-gray-100/60 text-urbis-blue" : "text-gray-700 hover:bg-gray-50 hover:text-urbis-blue", "group flex gap-x-3 rounded-md p-2 text-sm/6 font-semibold"])
                }, [
                  (v(), I(W(n.icon), X({ ref_for: !0 }, n.iconProps, {
                    class: ["size-6 shrink-0", n.iconProps ? "" : n.current ? "text-urbis-blue" : "text-gray-400 group-hover:text-urbis-blue"],
                    "aria-hidden": "true"
                  }), null, 16, ["class"]))
                ], 10, me)) : n.to ? (v(), I(r, {
                  key: 1,
                  to: n.to,
                  custom: ""
                }, {
                  default: F(({ href: b, navigate: f, isActive: T }) => [
                    q("a", {
                      href: b,
                      onClick: ce(() => {
                        f();
                      }, ["prevent"]),
                      class: j([T ? "bg-gray-100/60 text-urbis-blue" : "text-gray-700 hover:bg-gray-50 hover:text-urbis-blue", "group flex gap-x-3 rounded-md p-2 text-sm/6 font-semibold"])
                    }, [
                      (v(), I(W(n.icon), X({ ref_for: !0 }, n.iconProps, {
                        class: ["size-6 shrink-0", n.iconProps ? "" : T ? "text-urbis-blue" : "text-gray-400 group-hover:text-urbis-blue"],
                        "aria-hidden": "true"
                      }), null, 16, ["class"]))
                    ], 10, pe)
                  ]),
                  _: 2
                }, 1032, ["to"])) : z("", !0)
              ]))), 128))
            ]))), 128))
          ], 2)) : z("", !0),
          G(K, { name: "fade" }, {
            default: F(() => [
              w.value ? z("", !0) : (v(), m("div", {
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
}, ke = /* @__PURE__ */ fe(be, [["__scopeId", "data-v-cea64601"]]), xe = {
  install: (x, k) => {
    const t = (k == null ? void 0 : k.componentName) || "BottomSheet";
    x.component(t, ke);
  }
};
export {
  ke as BottomSheet,
  xe as default
};
