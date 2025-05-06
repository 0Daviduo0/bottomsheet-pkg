import { ref as r, watch as H, nextTick as L, computed as T, onMounted as ne, onUnmounted as oe, resolveComponent as se, createElementBlock as f, openBlock as c, createVNode as A, createElementVNode as q, Transition as G, withCtx as F, createCommentVNode as R, normalizeStyle as re, normalizeClass as $, Fragment as J, renderList as K, createBlock as j, resolveDynamicComponent as Q, mergeProps as W, withModifiers as ue, renderSlot as ie } from "vue";
import { useRoute as ce } from "vue-router";
const de = (k, g) => {
  const t = k.__vccOpts || k;
  for (const [u, Y] of g)
    t[u] = Y;
  return t;
}, ve = { class: "lg:hidden" }, fe = ["href"], he = ["href", "onClick"], me = 5, pe = {
  __name: "BottomSheet",
  props: {
    modelValue: Boolean,
    middleY: { type: Number, default: 50 },
    fullY: { type: Number, default: 5 },
    quickLinks: { type: Object }
  },
  emits: ["update:modelValue", "state-change", "handle-click"],
  setup(k, { emit: g }) {
    const t = k, u = g;
    ce();
    const Y = r(!1), V = r(""), X = r(null), Z = r(null), h = r(null), _ = r(null), m = r(!1), y = r(!1), z = r(0), w = r(100), l = r(100), M = r(0), C = r(0), n = r(100);
    H(h, async (e) => {
      e && (await L(), M.value = e.offsetHeight);
    }, { immediate: !0 });
    const ee = T(() => {
      const e = window.innerHeight;
      if (!e || M.value <= 0)
        return -1;
      const a = M.value / e * 100, s = (C.value || 0) / e * 100;
      return a + s;
    });
    H(ee, (e) => {
      if (e >= 0) {
        const a = Math.max(0, 100 - e);
        if (Math.abs(a - n.value) > 0.1) {
          const s = n.value;
          n.value = a, Math.abs(l.value - s) < 1 && (l.value = n.value), Math.abs(w.value - s) < 1 && !y.value && (w.value = n.value);
        }
      }
    }), T(() => [
      n.value,
      t.middleY,
      t.fullY
    ].sort((e, a) => a - e));
    const te = T(() => ({
      top: `${l.value}vh`,
      position: "fixed",
      left: "0",
      right: "0",
      bottom: "0",
      transition: m.value ? "none" : "top 0.3s ease-out",
      maxHeight: `calc(100vh - ${t.fullY}vh)`
    })), P = T(() => n.value < 100 && Math.abs(l.value - n.value) < 1);
    H(P, async (e) => {
      if (e && (await L(), _.value)) {
        const a = _.value.offsetHeight;
        a > 0 && C.value !== a && (C.value = a);
      }
    });
    const ae = (e) => {
      h.value && !h.value.contains(e.target) || (e.preventDefault(), e.stopPropagation(), y.value = !0, m.value = !1, z.value = e.clientY, w.value = l.value, window.addEventListener("pointermove", B, { passive: !1 }), window.addEventListener("pointerup", x), window.addEventListener("pointerleave", x));
    }, B = (e) => {
      if (!y.value) return;
      const a = e.clientY, s = Math.abs(a - z.value);
      if (!m.value && s > me && (m.value = !0, document.body.style.cursor = "grabbing", document.body.style.userSelect = "none"), m.value) {
        e.preventDefault();
        const i = a - z.value, p = window.innerHeight;
        if (p === 0) return;
        const o = i / p * 100;
        let d = w.value + o;
        const b = n.value < 100 ? n.value : t.middleY;
        d = Math.max(t.fullY, Math.min(b, d)), l.value = d;
      }
    }, x = (e) => {
      if (!y.value) return;
      const a = 1, s = Math.abs(w.value - n.value) < a;
      if (m.value) {
        m.value = !1, document.body.style.cursor = "", document.body.style.userSelect = "";
        const i = l.value, p = w.value, o = n.value, d = t.middleY, b = t.fullY;
        let v;
        const S = i < p;
        if (s && S)
          if (i > d - a)
            v = d;
          else {
            const O = Math.abs(i - d);
            v = Math.abs(i - b) < O ? b : d;
          }
        else
          v = [o, d, b].reduce((D, U) => Math.abs(U - i) < Math.abs(D - i) ? U : D);
        l.value = v;
        let N = "peek", E = !1;
        Math.abs(v - d) < a ? (N = "middle", E = !0) : Math.abs(v - b) < a && (N = "full", E = !0), t.modelValue !== E && u("update:modelValue", E), u("state-change", N, v);
      } else
        s && (u("handle-click"), l.value = t.middleY, t.modelValue || u("update:modelValue", !0), u("state-change", "middle", t.middleY));
      y.value = !1, window.removeEventListener("pointermove", B), window.removeEventListener("pointerup", x), window.removeEventListener("pointerleave", x);
    }, le = () => {
      l.value !== n.value && (l.value = n.value, t.modelValue && u("update:modelValue", !1), u("state-change", "peek", n.value));
    };
    ne(async () => {
      V.value = navigator.userAgent.toLowerCase(), Y.value = /ipad/.test(V.value) && /safari/.test(V.value) && !/chrome/.test(V.value), h.value && (await L(), M.value = h.value.offsetHeight), setTimeout(() => {
        const e = n.value;
        t.modelValue ? (Math.abs(l.value - e) < 1 || l.value >= 100) && (l.value = t.middleY, u("state-change", "middle", t.middleY)) : Math.abs(l.value - e) > 0.1 && (l.value = e, u("state-change", "peek", e));
      }, 0), window.addEventListener("resize", I);
    }), oe(() => {
      window.removeEventListener("pointermove", B), window.removeEventListener("pointerup", x), window.removeEventListener("pointerleave", x), window.removeEventListener("resize", I), document.body.style.cursor = "", document.body.style.userSelect = "";
    });
    const I = async () => {
      h.value && (await L(), M.value = h.value.offsetHeight), P.value && _.value && (await L(), C.value = _.value.offsetHeight);
    };
    return H(() => t.modelValue, (e) => {
      if (m.value || y.value) return;
      const a = l.value, s = 1, i = Math.abs(a - t.middleY) < s || Math.abs(a - t.fullY) < s, p = Math.abs(a - n.value) < s;
      e && !i ? (l.value = t.middleY, u("state-change", "middle", t.middleY)) : !e && !p && (l.value = n.value, u("state-change", "peek", n.value));
    }), (e, a) => {
      const s = se("router-link");
      return c(), f("div", ve, [
        A(G, { name: "fade" }, {
          default: F(() => [
            P.value ? R("", !0) : (c(), f("div", {
              key: 0,
              class: "fixed inset-0 z-40 bg-gray-900/60 pointer-events-auto",
              onClick: le
            }))
          ]),
          _: 1
        }),
        q("div", {
          ref_key: "sheetRef",
          ref: X,
          class: "fixed bottom-0 left-0 right-0 bg-white rounded-t-xl shadow-2xl flex flex-col pointer-events-auto overflow-hidden touch-pan-y z-50",
          style: re(te.value)
        }, [
          q("div", {
            ref_key: "handleRef",
            ref: h,
            class: "py-3 flex justify-center items-center cursor-grab active:cursor-grabbing touch-none flex-shrink-0",
            onPointerdown: ae
          }, a[0] || (a[0] = [
            q("div", { class: "w-10 h-1.5 bg-gray-300 rounded-full pointer-events-none" }, null, -1)
          ]), 544),
          P.value ? (c(), f("div", {
            key: 0,
            ref_key: "quickLinksRef",
            ref: _,
            class: $(["px-4", "pt-3", t.quickLinks ? "" : " p-12 ", Y.value && t.quickLinks ? " pb-24 border-t border-gray-200 " : "", !Y.value && t.quickLinks ? " pb-14 border-t border-gray-200 " : ""])
          }, [
            (c(!0), f(J, null, K(t.quickLinks, (i, p) => (c(), f("div", {
              key: `mobile-sheet-section-${p}`,
              class: "flex justify-around"
            }, [
              (c(!0), f(J, null, K(i.items, (o, d) => (c(), f("div", null, [
                o.href ? (c(), f("a", {
                  key: 0,
                  href: o.href,
                  class: $([o.current ? "bg-gray-100/60 text-urbis-blue" : "text-gray-700 hover:bg-gray-50 hover:text-urbis-blue", "group flex gap-x-3 rounded-md p-2 text-sm/6 font-semibold"])
                }, [
                  (c(), j(Q(o.icon), W({ ref_for: !0 }, o.iconProps, {
                    class: ["size-6 shrink-0", o.iconProps ? "" : o.current ? "text-urbis-blue" : "text-gray-400 group-hover:text-urbis-blue"],
                    "aria-hidden": "true"
                  }), null, 16, ["class"]))
                ], 10, fe)) : o.to ? (c(), j(s, {
                  key: 1,
                  to: o.to,
                  custom: ""
                }, {
                  default: F(({ href: b, navigate: v, isActive: S }) => [
                    q("a", {
                      href: b,
                      onClick: ue(() => {
                        v();
                      }, ["prevent"]),
                      class: $([S ? "bg-gray-100/60 text-urbis-blue" : "text-gray-700 hover:bg-gray-50 hover:text-urbis-blue", "group flex gap-x-3 rounded-md p-2 text-sm/6 font-semibold"])
                    }, [
                      (c(), j(Q(o.icon), W({ ref_for: !0 }, o.iconProps, {
                        class: ["size-6 shrink-0", o.iconProps ? "" : S ? "text-urbis-blue" : "text-gray-400 group-hover:text-urbis-blue"],
                        "aria-hidden": "true"
                      }), null, 16, ["class"]))
                    ], 10, he)
                  ]),
                  _: 2
                }, 1032, ["to"])) : R("", !0)
              ]))), 256))
            ]))), 128))
          ], 2)) : R("", !0),
          A(G, { name: "fade" }, {
            default: F(() => [
              P.value ? R("", !0) : (c(), f("div", {
                key: 0,
                ref_key: "contentRef",
                ref: Z,
                class: "flex-1 overflow-y-auto px-4 pb-4 min-h-[0]"
              }, [
                ie(e.$slots, "default", {}, void 0, !0)
              ], 512))
            ]),
            _: 3
          })
        ], 4)
      ]);
    };
  }
}, be = /* @__PURE__ */ de(pe, [["__scopeId", "data-v-de3f53df"]]), ye = {
  install: (k, g) => {
    const t = (g == null ? void 0 : g.componentName) || "BottomSheet";
    k.component(t, be);
  }
};
export {
  be as BottomSheet,
  ye as default
};
