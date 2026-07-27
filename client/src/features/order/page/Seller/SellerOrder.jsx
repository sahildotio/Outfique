  import { useEffect, useMemo, useState } from "react";
  import { useNavigate } from "react-router";
  import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
  import { CartesianGrid, Line, LineChart, XAxis, YAxis } from "recharts";
  import {
    ChartContainer,
    ChartTooltip,
    ChartTooltipContent,
  } from "@/components/ui/chart";
  import { useSellerOrder } from "../../hooks/useSellerOrder";

  // Shared with SellerAnalytics.jsx — worth lifting into one file (e.g.
  // sellerUi.js) once a third page needs the same tokens.
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

  const axisTick = {
    fontSize: 11,
    className: "fill-zinc-500 dark:fill-zinc-400",
  };
  const gridClass = "stroke-zinc-200 dark:stroke-white/10";
  const pointerStyle = { cursor: "pointer" };
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
    PENDING: { label: "Pending", color: COLORS.zinc },
    CONFIRMED: { label: "Confirmed", color: COLORS.blue },
    PROCESSING: { label: "Processing", color: COLORS.blue },
    PACKED: { label: "Packed", color: COLORS.purple },
    SHIPPED: { label: "Shipped", color: COLORS.amber },
    OUT_FOR_DELIVERY: { label: "Out for delivery", color: COLORS.amber },
    DELIVERED: { label: "Delivered", color: COLORS.emerald },
    CANCELLED: { label: "Cancelled", color: COLORS.brand },
    RETURNED: { label: "Returned", color: COLORS.brand },
    EXCHANGED: { label: "Exchanged", color: COLORS.purple },
  };
  const getStatusMeta = (status) =>
    STATUS_META[status] || { label: status || "Unknown", color: COLORS.zinc };

  const PAYMENT_META = {
    PAID: { label: "Paid", color: COLORS.emerald },
    PENDING: { label: "Pending", color: COLORS.zinc },
    FAILED: { label: "Failed", color: COLORS.brand },
    REFUNDED: { label: "Refunded", color: COLORS.blue },
  };
  const getPaymentMeta = (status) =>
    PAYMENT_META[status] || { label: status || "Unknown", color: COLORS.zinc };

  const container = {
    hidden: {},
    show: { transition: { staggerChildren: 0.07, delayChildren: 0.05 } },
  };

  const cardVariant = {
    hidden: { opacity: 0, y: 18 },
    show: { opacity: 1, y: 0, transition: { duration: 0.55, ease: easeOut } },
    hover: {
      y: -6,
      scale: 1.015,
      boxShadow: "0 24px 48px -24px rgba(230, 59, 31, 0.32)",
      transition: { duration: 0.35, ease: easeLuxury },
    },
    tap: {
      scale: 0.982,
      y: -2,
      transition: { duration: 0.15, ease: easeLuxury },
    },
  };
  const cardVariantReduced = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { duration: 0.4 } },
    hover: {},
    tap: {},
  };

  const rowVariant = {
    hidden: { opacity: 0, y: 10 },
    show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: easeOut } },
  };
  const rowVariantReduced = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { duration: 0.3 } },
  };

  const stateFade = {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 },
    transition: { duration: 0.3, ease: easeOut },
  };

  // ---------------------------------------------------------------------------
  // Shared visual primitives (same look as SellerAnalytics.jsx)
  // ---------------------------------------------------------------------------
  const StatCard = ({ icon, label, value }) => {
    const reduceMotion = useReducedMotion();
    return (
      <motion.div
        variants={reduceMotion ? cardVariantReduced : cardVariant}
        whileHover="hover"
        whileTap="tap"
        className="group cursor-pointer rounded-2xl border border-zinc-200 dark:border-white/10 bg-white dark:bg-[#141414] p-5 flex items-center gap-4 transition-colors duration-300 hover:border-[#e63b1f]/40 dark:hover:border-[#e63b1f]/30"
      >
        <div className="w-11 h-11 rounded-xl bg-[#e63b1f]/10 flex items-center justify-center shrink-0 transition-transform duration-300 ease-out group-hover:scale-110 group-hover:-rotate-3">
          <i className={`${icon} text-lg text-[#e63b1f]`} />
        </div>
        <div className="min-w-0">
          <p className="text-xl font-semibold text-zinc-900 dark:text-white truncate">
            {value}
          </p>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
            {label}
          </p>
        </div>
      </motion.div>
    );
  };

  const ChartCard = ({ title, description, children, className = "" }) => {
    const reduceMotion = useReducedMotion();
    return (
      <motion.div
        variants={reduceMotion ? cardVariantReduced : cardVariant}
        whileHover="hover"
        whileTap="tap"
        className={`group cursor-pointer rounded-2xl border border-zinc-200 dark:border-white/10 bg-white dark:bg-[#141414] p-5 sm:p-6 transition-colors duration-300 hover:border-[#e63b1f]/40 dark:hover:border-[#e63b1f]/30 ${className}`}
      >
        <div className="mb-5">
          <h3 className="text-sm font-semibold text-zinc-900 dark:text-white transition-colors duration-300 group-hover:text-[#e63b1f]">
            {title}
          </h3>
          {description && (
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
              {description}
            </p>
          )}
          <span
            className="block h-px w-0 bg-[#e63b1f] mt-3 transition-all duration-500 group-hover:w-10"
            style={{ transitionTimingFunction: "cubic-bezier(0.76, 0, 0.24, 1)" }}
          />
        </div>
        {children}
      </motion.div>
    );
  };

  const SkeletonBlock = ({ className = "" }) => {
    const reduceMotion = useReducedMotion();
    return (
      <motion.div
        className={`rounded-2xl bg-zinc-100 dark:bg-white/[0.06] ${className}`}
        animate={reduceMotion ? { opacity: 0.7 } : { opacity: [0.5, 1, 0.5] }}
        transition={
          reduceMotion
            ? { duration: 0 }
            : { duration: 1.6, repeat: Infinity, ease: "easeInOut" }
        }
      />
    );
  };

 const StatusBadge = ({ label, color }) => (
    <span
      className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium whitespace-nowrap"
      style={{ color, backgroundColor: `${color}1A` }}
    >
      <span
        className="w-1.5 h-1.5 rounded-full shrink-0"
        style={{ backgroundColor: color }}
      />
      {label}
    </span>
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
                layoutId="order-tab-pill"
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
                  layoutId="order-page-pill"
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

  // ---------------------------------------------------------------------------
  // Page
  // ---------------------------------------------------------------------------
  const SellerOrder = () => {
    const reduceMotion = useReducedMotion();
    const navigate = useNavigate();
    const { handleGetSellerOrder } = useSellerOrder();

    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState("ALL");
    const [page, setPage] = useState(1);

    useEffect(() => {
      const fetchData = async () => {
        setLoading(true);
        try {
          const res = await handleGetSellerOrder();
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

const stats = useMemo(() => {
  const list = data || [];

  const totalRevenue = list.reduce((sum, o) => sum + (o.totalAmount || 0), 0);

  const customerIds = new Set(list.map((o) => o.buyer?._id).filter(Boolean));

  const pendingRequests = list.filter((order) => {
    if (!order.request) return false;

    return (
      ["RETURN", "EXCHANGED"].includes(order.request.type) &&
      order.request.status === "PENDING"
    );
  }).length;

  return {
    totalOrders: list.length,
    totalRevenue,
    totalCustomers: customerIds.size,
    pendingRequests,
  };
}, [data]);

    const revenueTrend = useMemo(() => {
      return [...(data || [])]
        .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt))
        .map((o) => ({
          date: formatShortDate(o.createdAt),
          revenue: o.totalAmount,
        }));
    }, [data]);

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

    const chartAnim = useMemo(
      () =>
        reduceMotion
          ? { isAnimationActive: false }
          : { animationDuration: 900, animationEasing: "ease-out" },
      [reduceMotion],
    );

    const isEmpty = !data || data.length === 0;

    return (
      <div className="min-h-screen bg-white dark:bg-[#0d0d0d] text-zinc-900 dark:text-white transition-colors duration-300 px-6 py-10 md:px-16 md:py-14">
        <AnimatePresence mode="wait">
          {loading ? (
            <motion.div key="loading" {...stateFade}>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                {[...Array(4)].map((_, i) => (
                  <SkeletonBlock key={i} className="h-20" />
                ))}
              </div>
              <SkeletonBlock className="h-56 mb-6" />
              <SkeletonBlock className="h-[420px]" />
            </motion.div>
          ) : isEmpty ? (
            <motion.div
              key="empty"
              {...stateFade}
              className="min-h-[60vh] flex flex-col items-center justify-center gap-2 text-center"
            >
              <i className="ri-inbox-line text-3xl text-zinc-300 dark:text-white/20" />
              <p className="text-sm text-zinc-500 dark:text-zinc-400">
                No orders yet — they'll show up here once buyers start checking
                out.
              </p>
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
                  Seller Dashboard
                </span>
                <h1 className="mt-3 text-3xl md:text-4xl font-semibold tracking-tight">
                  Orders
                </h1>
                <div className="mt-4 h-px bg-zinc-200 dark:bg-white/10" />
              </motion.div>

              {/* KPI row */}
              <motion.div
                variants={container}
                initial="hidden"
                animate="show"
                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6"
              >
                <StatCard
                  icon="ri-file-list-3-line"
                  label="Total Orders"
                  value={stats.totalOrders}
                />
                <StatCard
                  icon="ri-money-rupee-circle-line"
                  label="Total Revenue"
                  value={formatPrice(stats.totalRevenue)}
                />
                <StatCard
                  icon="ri-group-line"
                  label="Total Customers"
                  value={stats.totalCustomers}
                />
                <StatCard
                  icon="ri-arrow-go-back-line"
                  label="Pending Returns / Exchanges"
                  value={stats.pendingRequests}
                />
              </motion.div>

              {/* Revenue trend */}
              <motion.div
                variants={container}
                initial="hidden"
                animate="show"
                className="mb-6"
              >
                <ChartCard
                  title="Revenue Trend"
                  description={`${stats.totalOrders} order${stats.totalOrders !== 1 ? "s" : ""} · ${formatPrice(stats.totalRevenue)} total`}
                >
                  <ChartContainer
                    config={{ revenue: { label: "Revenue" } }}
                    className="h-[200px] w-full"
                  >
                    <LineChart accessibilityLayer data={revenueTrend}>
                      <CartesianGrid vertical={false} className={gridClass} />
                      <XAxis
                        dataKey="date"
                        tickLine={false}
                        axisLine={false}
                        tickMargin={10}
                        tick={axisTick}
                      />
                      <YAxis
                        tickLine={false}
                        axisLine={false}
                        tickMargin={8}
                        tick={axisTick}
                        width={40}
                      />
                      <ChartTooltip
                        content={
                          <ChartTooltipContent
                            formatter={(v) => formatPrice(v)}
                          />
                        }
                      />
                      <Line
                        dataKey="revenue"
                        type="monotone"
                        stroke={COLORS.brand}
                        strokeWidth={2.5}
                        dot={{ r: 4, fill: COLORS.brand }}
                        activeDot={{ r: 6 }}
                        style={pointerStyle}
                        {...chartAnim}
                      />
                    </LineChart>
                  </ChartContainer>
                </ChartCard>
              </motion.div>

              {/* Orders panel */}
              <motion.div
                initial={reduceMotion ? { opacity: 0 } : { opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.55, ease: easeOut, delay: 0.1 }}
                className="rounded-2xl border border-zinc-200 dark:border-white/10 bg-white dark:bg-[#141414] p-5 sm:p-6"
              >
                <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
                  <StatusTabs
                    tabs={statusTabs}
                    active={activeTab}
                    onChange={setActiveTab}
                  />
                </div>

                {pageItems.length === 0 ? (
                  <div className="h-40 flex items-center justify-center text-sm text-zinc-400 dark:text-zinc-600">
                    No orders in this view
                  </div>
                ) : (
                  <div className="overflow-x-auto -mx-5 sm:mx-0">
                    <table className="w-full min-w-[720px] text-sm">
                      <thead>
                        <tr className="border-b border-zinc-200 dark:border-white/10 text-left text-xs text-zinc-500 dark:text-zinc-400">
                          <th className="py-3 pl-5 sm:pl-0 pr-3 font-medium">
                            Order
                          </th>
                          <th className="py-3 px-3 font-medium">Date</th>
                          <th className="py-3 px-3 font-medium">Customer</th>
                          <th className="py-3 px-3 font-medium">Payment</th>
                          <th className="py-3 px-3 font-medium">Status</th>
                          <th className="py-3 px-3 pr-5 sm:pr-0 font-medium text-right">
                            Total
                          </th>
                        </tr>
                      </thead>
                      <motion.tbody
                        key={activeTab + page}
                        variants={container}
                        initial="hidden"
                        animate="show"
                      >
                        {pageItems.map((order) => {
                          const statusMeta = getStatusMeta(order.orderStatus);
                          const paymentMeta = getPaymentMeta(order.paymentStatus);
                          const firstItem = order.items?.[0];
                          const itemLabel =
                            firstItem?.product?.title || "Item unavailable";
                          const extraCount = (order.items?.length || 0) - 1;

                          return (
                            <motion.tr
                              key={order._id}
                              variants={
                                reduceMotion ? rowVariantReduced : rowVariant
                              }
                              onClick={() =>
                                navigate(`/seller/order/${order._id}`)
                              }
                              className="group border-b border-zinc-100 dark:border-white/[0.06] last:border-b-0 cursor-pointer transition-colors duration-200 hover:bg-zinc-50 dark:hover:bg-white/[0.03]"
                            >
                              <td className="py-4 pl-5 sm:pl-0 px-3">
                                <p className="font-medium text-zinc-900 dark:text-white truncate max-w-[220px]">
                                  {order.orderNumber}
                                </p>
                                <p className="text-xs text-zinc-500 dark:text-zinc-400 truncate max-w-[220px]">
                                  {itemLabel}
                                  {extraCount > 0 ? ` +${extraCount} more` : ""}
                                </p>
                              </td>
                              <td className="py-4 px-3 text-zinc-600 dark:text-zinc-400 whitespace-nowrap">
                                {formatShortDate(order.createdAt)}
                              </td>
                              <td className="py-4 px-3">
                                <p className="text-zinc-700 dark:text-zinc-300 truncate max-w-[180px]">
                                  {order.buyer?.email || "—"}
                                </p>
                              </td>
                              <td className="py-4 px-3">
                                <div className="flex flex-col items-start gap-1">
                                  <span className="text-[11px] text-zinc-500 dark:text-zinc-400">
                                    {order.paymentMethod}
                                  </span>
                                  <StatusBadge {...paymentMeta} />
                                </div>
                              </td>
                              <td className="py-4 px-3">
                                <div className="flex flex-col items-start gap-1">
                                  <StatusBadge {...statusMeta} />
                                  {order.request && (
                                    <span className="text-[10px] text-zinc-400 dark:text-zinc-500">
                                      {order.request.type === "RETURN"
                                        ? "Return"
                                        : "Exchange"}{" "}
                                      · {order.request.status.toLowerCase()}
                                    </span>
                                  )}
                                </div>
                              </td>
                              <td className="py-4 px-3 pr-5 sm:pr-0 text-right font-medium text-zinc-900 dark:text-white whitespace-nowrap">
                                {formatPrice(order.totalAmount)}
                              </td>
                            </motion.tr>
                          );
                        })}
                      </motion.tbody>
                    </table>
                  </div>
                )}

                {totalPages > 1 && (
                  <Pagination
                    page={page}
                    totalPages={totalPages}
                    onChange={setPage}
                  />
                )}
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  };

  export default SellerOrder;
