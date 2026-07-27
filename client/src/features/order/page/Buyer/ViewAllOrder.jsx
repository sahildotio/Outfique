import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Skeleton } from "@/components/ui/skeleton";
import { useBuyerOrder } from "../../hooks/useBuyerOrder";

// Shared with SellerOrder.jsx / SellerOrderDetail.jsx — worth lifting into
// one file (e.g. sellerUi.js) once a third page needs the same tokens.
const easeOut = [0.22, 1, 0.36, 1];
const easeLuxury = [0.76, 0, 0.24, 1];

const COLORS = {
  brand: "#e63b1f",
  amber: "#f59e0b",
  emerald: "#10b981",
  blue: "#3b82f6",
  purple: "#8b5cf6",
  zinc: "#a1a1aa",
};

const pageSize = 6;

const formatPrice = (amount) => {
  const n = Number(amount);
  if (Number.isNaN(n)) return "—";
  try {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(n);
  } catch {
    return `₹${amount}`;
  }
};

const formatShortDate = (iso) =>
  new Date(iso).toLocaleDateString("en-IN", { day: "2-digit", month: "short" });

// ---------------------------------------------------------------------------
// Status → color mapping. Falls back gracefully for any status not listed,
// so an unseen enum value never breaks the badge.
// ---------------------------------------------------------------------------
const STATUS_META = {
  PENDING: { label: "Pending", color: COLORS.zinc, icon: "ri-time-line" },
  CONFIRMED: {
    label: "Confirmed",
    color: COLORS.blue,
    icon: "ri-checkbox-circle-line",
  },
  PROCESSING: {
    label: "Processing",
    color: COLORS.blue,
    icon: "ri-loader-4-line",
  },
  PACKED: { label: "Packed", color: COLORS.purple, icon: "ri-archive-2-line" },
  SHIPPED: { label: "Shipped", color: COLORS.amber, icon: "ri-truck-line" },
  OUT_FOR_DELIVERY: {
    label: "Out for delivery",
    color: COLORS.amber,
    icon: "ri-e-bike-2-line",
  },
  DELIVERED: {
    label: "Delivered",
    color: COLORS.emerald,
    icon: "ri-checkbox-circle-fill",
  },
  CANCELLED: {
    label: "Cancelled",
    color: COLORS.brand,
    icon: "ri-close-circle-line",
  },
  RETURNED: {
    label: "Returned",
    color: COLORS.brand,
    icon: "ri-arrow-go-back-line",
  },
  EXCHANGED: {
    label: "Exchanged",
    color: COLORS.purple,
    icon: "ri-repeat-line",
  },
};
const getStatusMeta = (status) =>
  STATUS_META[status] || {
    label: status || "Unknown",
    color: COLORS.zinc,
    icon: "ri-question-line",
  };

const REQUEST_STATUS_META = {
  PENDING: { label: "Under review", color: COLORS.amber },
  APPROVED: { label: "Approved", color: COLORS.emerald },
  REJECTED: { label: "Rejected", color: COLORS.brand },
};
const getRequestStatusMeta = (status) =>
  REQUEST_STATUS_META[status] || {
    label: status || "Unknown",
    color: COLORS.zinc,
  };

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08, delayChildren: 0.05 } },
};

const cardVariant = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: easeOut } },
  hover: {
    y: -4,
    boxShadow: "0 20px 40px -24px rgba(230, 59, 31, 0.28)",
    transition: { duration: 0.3, ease: easeLuxury },
  },
  tap: { scale: 0.99, transition: { duration: 0.15, ease: easeLuxury } },
};
const cardVariantReduced = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { duration: 0.35 } },
  hover: {},
  tap: {},
};

const stateFade = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 },
  transition: { duration: 0.3, ease: easeOut },
};

// ---------------------------------------------------------------------------
// Shared visual primitives
// ---------------------------------------------------------------------------
const StatusBadge = ({ label, color, size = "md" }) => (
  <span
    className={`inline-flex items-center gap-1.5 rounded-full font-medium whitespace-nowrap ${
      size === "sm" ? "px-2 py-0.5 text-[11px]" : "px-2.5 py-1 text-xs"
    }`}
    style={{ color, backgroundColor: `${color}1A` }}
  >
    <span
      className="w-1.5 h-1.5 rounded-full shrink-0"
      style={{ backgroundColor: color }}
    />
    {label}
  </span>
);

const SkeletonCard = () => (
  <div className="rounded-2xl border border-zinc-200 dark:border-white/10 bg-white dark:bg-[#141414] p-5 flex items-center gap-4">
    <Skeleton className="w-14 h-14 rounded-xl shrink-0" />
    <div className="flex-1 space-y-2">
      <Skeleton className="h-4 w-40" />
      <Skeleton className="h-3 w-28" />
    </div>
    <Skeleton className="h-6 w-20 rounded-full" />
  </div>
);

// Sliding-pill segmented control — tabs are generated from whatever
// orderStatus values actually appear in the data, so it never shows an
// empty category.
const StatusTabs = ({ tabs, active, onChange }) => (
  <div className="flex flex-wrap items-center gap-1 rounded-xl border border-zinc-200 dark:border-white/10 bg-zinc-50 dark:bg-white/[0.03] p-1">
    {tabs.map((tab) => {
      const isActive = tab.key === active;
      return (
        <button
          key={tab.key}
          type="button"
          onClick={() => onChange(tab.key)}
          className={`relative cursor-pointer rounded-lg px-3.5 py-2 text-xs font-medium transition-colors duration-300 ${
            isActive
              ? "text-white dark:text-[#0d0d0d]"
              : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white"
          }`}
        >
          {isActive && (
            <motion.span
              layoutId="buyer-order-tab-pill"
              className="absolute inset-0 rounded-lg bg-zinc-900 dark:bg-white"
              transition={{ duration: 0.35, ease: easeLuxury }}
            />
          )}
          <span className="relative flex items-center gap-1.5">
            {tab.label}
            {tab.count > 0 && (
              <span
                className={`rounded-full px-1.5 py-0.5 text-[10px] font-semibold transition-colors duration-300 ${
                  isActive
                    ? "bg-white/25 dark:bg-[#0d0d0d]/10"
                    : "bg-zinc-200 dark:bg-white/10"
                }`}
              >
                {tab.count}
              </span>
            )}
          </span>
        </button>
      );
    })}
  </div>
);

const buildPageRange = (current, total) => {
  const delta = 1;
  const range = [];
  const withDots = [];
  let last;
  for (let i = 1; i <= total; i++) {
    if (
      i === 1 ||
      i === total ||
      (i >= current - delta && i <= current + delta)
    ) {
      range.push(i);
    }
  }
  range.forEach((i) => {
    if (last) {
      if (i - last === 2) withDots.push(last + 1);
      else if (i - last > 2) withDots.push("…");
    }
    withDots.push(i);
    last = i;
  });
  return withDots;
};

const Pagination = ({ page, totalPages, onChange }) => {
  const pages = useMemo(
    () => buildPageRange(page, totalPages),
    [page, totalPages],
  );
  return (
    <div className="flex items-center justify-center gap-1 pt-6">
      <button
        type="button"
        onClick={() => onChange(page - 1)}
        disabled={page === 1}
        className="cursor-pointer disabled:cursor-not-allowed w-8 h-8 rounded-lg flex items-center justify-center text-zinc-500 dark:text-zinc-400 transition-colors duration-200 hover:bg-zinc-100 dark:hover:bg-white/[0.06] disabled:opacity-40 disabled:hover:bg-transparent"
      >
        <i className="ri-arrow-left-s-line text-base" />
      </button>
      {pages.map((p, i) =>
        p === "…" ? (
          <span
            key={`dots-${i}`}
            className="px-1.5 text-xs text-zinc-400 dark:text-zinc-600"
          >
            …
          </span>
        ) : (
          <button
            key={p}
            type="button"
            onClick={() => onChange(p)}
            className="relative cursor-pointer w-8 h-8 rounded-lg text-xs font-medium transition-colors duration-200"
          >
            {p === page && (
              <motion.span
                layoutId="buyer-order-page-pill"
                className="absolute inset-0 rounded-lg bg-[#e63b1f]"
                transition={{ duration: 0.3, ease: easeLuxury }}
              />
            )}
            <span
              className={`relative ${
                p === page
                  ? "text-white"
                  : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white"
              }`}
            >
              {p}
            </span>
          </button>
        ),
      )}
      <button
        type="button"
        onClick={() => onChange(page + 1)}
        disabled={page === totalPages}
        className="cursor-pointer disabled:cursor-not-allowed w-8 h-8 rounded-lg flex items-center justify-center text-zinc-500 dark:text-zinc-400 transition-colors duration-200 hover:bg-zinc-100 dark:hover:bg-white/[0.06] disabled:opacity-40 disabled:hover:bg-transparent"
      >
        <i className="ri-arrow-right-s-line text-base" />
      </button>
    </div>
  );
};

// A single order card. Shows the first item's title, item/variant count,
// order status, and — if a return/exchange was ever raised — a small
// secondary badge for that request's own status.
const OrderCard = ({ order, onClick }) => {
  const reduceMotion = useReducedMotion();
  const statusMeta = getStatusMeta(order.orderStatus);
  const firstItem = order.items?.[0];
  const itemLabel = firstItem?.product?.title || "Product unavailable";
  const extraCount = (order.items?.length || 0) - 1;
  const request = order.request;
  const requestMeta = request ? getRequestStatusMeta(request.status) : null;

  return (
    <motion.div
      variants={reduceMotion ? cardVariantReduced : cardVariant}
      whileHover="hover"
      whileTap="tap"
      onClick={onClick}
      className="group cursor-pointer rounded-2xl border border-zinc-200 dark:border-white/10 bg-white dark:bg-[#141414] p-5 transition-colors duration-300 hover:border-[#e63b1f]/40 dark:hover:border-[#e63b1f]/30"
    >
      <div className="flex items-center gap-4">
        <div className="w-14 h-14 rounded-xl bg-zinc-100 dark:bg-white/[0.06] flex items-center justify-center shrink-0 transition-transform duration-300 ease-out group-hover:scale-105">
          <i className="ri-t-shirt-line text-xl text-zinc-400 dark:text-zinc-500" />
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="text-sm font-semibold text-zinc-900 dark:text-white truncate">
                {order.orderNumber}
              </p>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 truncate mt-0.5">
                {itemLabel}
                {extraCount > 0 ? ` +${extraCount} more` : ""}
              </p>
            </div>
            <p className="text-sm font-semibold text-zinc-900 dark:text-white shrink-0">
              {formatPrice(order.totalAmount)}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 mt-3">
            <StatusBadge {...statusMeta} size="sm" />
            {requestMeta && (
              <StatusBadge
                label={`${request.type === "RETURN" ? "Return" : "Exchange"} · ${requestMeta.label}`}
                color={requestMeta.color}
                size="sm"
              />
            )}
            <span className="text-[11px] text-zinc-400 dark:text-zinc-500 ml-auto">
              {formatShortDate(order.createdAt)}
            </span>
          </div>
        </div>

        <i className="ri-arrow-right-s-line text-lg text-zinc-300 dark:text-white/20 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:text-[#e63b1f] shrink-0" />
      </div>
    </motion.div>
  );
};

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------
const ViewAllOrder = () => {
  const reduceMotion = useReducedMotion();
  const navigate = useNavigate();
  const { handleGetAllBuyerOrder } = useBuyerOrder();

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("ALL");
  const [page, setPage] = useState(1);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const res = await handleGetAllBuyerOrder();
        setData(res);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    setPage(1);
  }, [activeTab]);

  const sortedData = useMemo(
    () =>
      [...(data || [])].sort(
        (a, b) => new Date(b.createdAt) - new Date(a.createdAt),
      ),
    [data],
  );

  const statusTabs = useMemo(() => {
    const list = data || [];
    const counts = list.reduce((acc, o) => {
      acc[o.orderStatus] = (acc[o.orderStatus] || 0) + 1;
      return acc;
    }, {});
    const tabs = [{ key: "ALL", label: "All", count: list.length }];
    Object.keys(counts)
      .sort()
      .forEach((status) => {
        tabs.push({
          key: status,
          label: getStatusMeta(status).label,
          count: counts[status],
        });
      });
    const requestsCount = list.filter((o) => o.request).length;
    if (requestsCount > 0) {
      tabs.push({
        key: "REQUESTS",
        label: "Returns / Exchanges",
        count: requestsCount,
      });
    }
    return tabs;
  }, [data]);

  const filtered = useMemo(() => {
    if (activeTab === "ALL") return sortedData;
    if (activeTab === "REQUESTS") return sortedData.filter((o) => o.request);
    return sortedData.filter((o) => o.orderStatus === activeTab);
  }, [sortedData, activeTab]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const pageItems = useMemo(
    () => filtered.slice((page - 1) * pageSize, page * pageSize),
    [filtered, page],
  );

  const isEmpty = !data || data.length === 0;

  return (
    <div className="min-h-screen bg-white dark:bg-[#0d0d0d] text-zinc-900 dark:text-white transition-colors duration-300 px-6 py-10 md:px-16 md:py-14">
      <AnimatePresence mode="wait">
        {loading ? (
          <motion.div key="loading" {...stateFade}>
            <Skeleton className="h-8 w-40 mb-8 rounded-lg" />
            <Skeleton className="h-11 w-full max-w-md mb-6 rounded-xl" />
            <div className="space-y-3">
              {[...Array(4)].map((_, i) => (
                <SkeletonCard key={i} />
              ))}
            </div>
          </motion.div>
        ) : isEmpty ? (
          <motion.div
            key="empty"
            {...stateFade}
            className="min-h-[60vh] flex flex-col items-center justify-center gap-3 text-center"
          >
            <i className="ri-shopping-bag-3-line text-3xl text-zinc-300 dark:text-white/20" />
            <p className="text-sm text-zinc-500 dark:text-zinc-400">
              No orders yet — anything you buy will show up here.
            </p>
            <button
              type="button"
              onClick={() => navigate("/")}
              className="cursor-pointer text-sm font-medium text-[#e63b1f] hover:underline"
            >
              Start shopping
            </button>
          </motion.div>
        ) : (
          <motion.div key="content" {...stateFade}>
            {/* Header */}
            <motion.div
              initial={reduceMotion ? { opacity: 0 } : { opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease: easeOut }}
              className="mb-8"
            >
              <span className="text-xs font-medium tracking-[0.15em] uppercase text-zinc-500 dark:text-zinc-400">
                Your Account
              </span>
              <h1 className="mt-3 text-3xl md:text-4xl font-semibold tracking-tight">
                Orders
              </h1>
              <div className="mt-4 h-px bg-zinc-200 dark:bg-white/10" />
            </motion.div>

            {/* Tabs */}
            <motion.div
              initial={reduceMotion ? { opacity: 0 } : { opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease: easeOut, delay: 0.05 }}
              className="mb-6"
            >
              <StatusTabs
                tabs={statusTabs}
                active={activeTab}
                onChange={setActiveTab}
              />
            </motion.div>

            {/* Order list */}
            {pageItems.length === 0 ? (
              <div className="h-40 flex items-center justify-center text-sm text-zinc-400 dark:text-zinc-600 rounded-2xl border border-dashed border-zinc-200 dark:border-white/10">
                No orders in this view
              </div>
            ) : (
              <motion.div
                key={activeTab + page}
                variants={container}
                initial="hidden"
                animate="show"
                className="space-y-3"
              >
                {pageItems.map((order) => (
                  <OrderCard
                    key={order._id}
                    order={order}
                    onClick={() => navigate(`/orders/${order._id}`)}
                  />
                ))}
              </motion.div>
            )}

            {totalPages > 1 && (
              <Pagination
                page={page}
                totalPages={totalPages}
                onChange={setPage}
              />
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ViewAllOrder;
