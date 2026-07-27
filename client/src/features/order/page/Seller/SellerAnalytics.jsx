import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useEffect, useMemo, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  Pie,
  PieChart,
  XAxis,
  YAxis,
} from "recharts";
import { useSellerOrder } from "../../hooks/useSellerOrder";

// Entrance easing — gentle deceleration, matches the rest of the app.
const easeOut = [0.22, 1, 0.36, 1];
// Hover/tap easing — the same curve used on the product card image-reveal,
// kept consistent here so every interactive surface feels like one brand.
const easeLuxury = [0.76, 0, 0.24, 1];

// brand-first palette — kept as fixed hex rather than CSS chart tokens so
// colors render correctly whether or not --chart-1..5 are defined in globals.css
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

// Cursor affordance for recharts' internal SVG nodes — Tailwind classes
// don't reach into the chart's own elements, so this goes on as a style prop.
const pointerStyle = { cursor: "pointer" };

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

const container = {
  hidden: {},
  show: {
    transition: { staggerChildren: 0.07, delayChildren: 0.05 },
  },
};

// Full-motion card variant — entrance, hover lift, and tap feedback.
const cardVariant = {
  hidden: { opacity: 0, y: 18 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.55, ease: easeOut },
  },
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

// Reduced-motion fallback — fade only, no transform, no hover lift.
const cardVariantReduced = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { duration: 0.4 } },
  hover: {},
  tap: {},
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

const EmptyChart = ({ label }) => (
  <div className="h-[240px] flex items-center justify-center text-sm text-zinc-400 dark:text-zinc-600">
    {label}
  </div>
);

// Shimmering skeleton block — smoother than a flat CSS pulse, and sits
// still (no transform) so it's safe to keep even under reduced motion.
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

const stateFade = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 },
  transition: { duration: 0.3, ease: easeOut },
};

const SellerAnalytics = () => {
  const reduceMotion = useReducedMotion();
  const { handleSellerAnalytics } = useSellerOrder();

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);

      try {
        const data = await handleSellerAnalytics();
        setData(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const recentOrders = data?.recentOrders || [];

  // Revenue — no time-series field exists on the payload, so this is built
  // from each recent order's own amount + date, chronologically.
  const revenueData = useMemo(() => {
    return [...recentOrders]
      .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt))
      .map((o) => ({
        date: formatShortDate(o.createdAt),
        revenue: o.totalAmount,
      }));
  }, [recentOrders]);

  // Order status — direct counts from the payload
  const orderStatusData = useMemo(() => {
    if (!data) return [];
    return [
      { status: "Pending", count: data.pendingOrders, fill: COLORS.zinc },
      { status: "Processing", count: data.processingOrders, fill: COLORS.blue },
      { status: "Shipped", count: data.shippedOrders, fill: COLORS.amber },
      {
        status: "Delivered",
        count: data.deliveredOrders,
        fill: COLORS.emerald,
      },
      { status: "Cancelled", count: data.cancelledOrders, fill: COLORS.brand },
    ];
  }, [data]);

  // Inventory — active/outOfStock/lowStock vs. whatever's left uncategorized
  const inventoryData = useMemo(() => {
    if (!data) return [];
    const tracked =
      (data.activeProducts || 0) +
      (data.outOfStockProducts || 0) +
      (data.lowStockProducts || 0);
    const untracked = Math.max((data.totalProducts || 0) - tracked, 0);
    return [
      { name: "Active", value: data.activeProducts, fill: COLORS.emerald },
      {
        name: "Out of Stock",
        value: data.outOfStockProducts,
        fill: COLORS.brand,
      },
      { name: "Low Stock", value: data.lowStockProducts, fill: COLORS.amber },
      { name: "Uncategorized", value: untracked, fill: COLORS.zinc },
    ].filter((d) => d.value > 0);
  }, [data]);

  const topProductsData = useMemo(
    () =>
      (data?.topProducts || []).map((p) => ({ title: p.title, sold: p.sold })),
    [data],
  );

  // Customer growth — cumulative distinct buyers across recent orders, in
  // chronological order (no historical signup data exists in the payload)
  const customerGrowthData = useMemo(() => {
    const sorted = [...recentOrders].sort(
      (a, b) => new Date(a.createdAt) - new Date(b.createdAt),
    );
    const seen = new Set();
    return sorted.map((o) => {
      seen.add(o.buyer?._id);
      return { date: formatShortDate(o.createdAt), customers: seen.size };
    });
  }, [recentOrders]);

  const paymentMethodData = useMemo(() => {
    const counts = recentOrders.reduce((acc, o) => {
      const key = o.paymentMethod || "Unknown";
      acc[key] = (acc[key] || 0) + 1;
      return acc;
    }, {});
    const palette = [
      COLORS.brand,
      COLORS.blue,
      COLORS.emerald,
      COLORS.amber,
      COLORS.purple,
    ];
    return Object.entries(counts).map(([method, count], i) => ({
      method,
      count,
      fill: palette[i % palette.length],
    }));
  }, [recentOrders]);

  const returnExchangeData = useMemo(() => {
    if (!data) return [];
    return [
      { name: "Returns", value: data.returnRequests, fill: COLORS.brand },
      { name: "Exchanges", value: data.exchangeRequests, fill: COLORS.blue },
    ].filter((d) => d.value > 0);
  }, [data]);

  // Chart-internal animation — disabled outright when the OS asks for
  // reduced motion, instead of just slowing it down.
  const chartAnim = useMemo(
    () =>
      reduceMotion
        ? { isAnimationActive: false }
        : { animationDuration: 900, animationEasing: "ease-out" },
    [reduceMotion],
  );

  return (
    <div className="min-h-screen bg-white dark:bg-[#0d0d0d] text-zinc-900 dark:text-white transition-colors duration-300 px-6 py-10 md:px-16 md:py-14">
      <AnimatePresence mode="wait">
        {loading ? (
          <motion.div key="loading" {...stateFade}>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
              {[...Array(5)].map((_, i) => (
                <SkeletonBlock key={i} className="h-20" />
              ))}
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {[...Array(4)].map((_, i) => (
                <SkeletonBlock key={i} className="h-72" />
              ))}
            </div>
          </motion.div>
        ) : !data ? (
          <motion.div
            key="empty"
            {...stateFade}
            className="min-h-[60vh] flex items-center justify-center"
          >
            <p className="text-sm text-zinc-500 dark:text-zinc-400">
              Couldn't load analytics right now.
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
                Analytics
              </h1>
              <div className="mt-4 h-px bg-zinc-200 dark:bg-white/10" />
            </motion.div>

            {/* KPI row */}
            <motion.div
              variants={container}
              initial="hidden"
              animate="show"
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-8"
            >
              <StatCard
                icon="ri-shopping-bag-3-line"
                label="Total Products"
                value={data.totalProducts}
              />
              <StatCard
                icon="ri-file-list-3-line"
                label="Total Orders"
                value={data.totalOrders}
              />
              <StatCard
                icon="ri-money-rupee-circle-line"
                label="Total Revenue"
                value={formatPrice(data.totalRevenue)}
              />
              <StatCard
                icon="ri-group-line"
                label="Total Customers"
                value={data.totalCustomers}
              />
              <StatCard
                icon="ri-bar-chart-2-line"
                label="Avg. Order Value"
                value={formatPrice(data.averageOrderValue)}
              />
            </motion.div>

            {/* Charts */}
            <motion.div
              variants={container}
              initial="hidden"
              animate="show"
              className="grid grid-cols-1 gap-6"
            >
              {/* Revenue — line */}
              <ChartCard
                title="Revenue"
                description={`Today ${formatPrice(data.todayRevenue)} · This month ${formatPrice(data.monthlyRevenue)}`}
              >
                {revenueData.length === 0 ? (
                  <EmptyChart label="No revenue yet" />
                ) : (
                  <ChartContainer
                    config={{ revenue: { label: "Revenue" } }}
                    className="h-[240px] w-full"
                  >
                    <LineChart accessibilityLayer data={revenueData}>
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
                )}
              </ChartCard>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Order status — bar */}
                <ChartCard
                  title="Order Status"
                  description="Orders by current status"
                >
                  <ChartContainer
                    config={{ count: { label: "Orders" } }}
                    className="h-[240px] w-full"
                  >
                    <BarChart accessibilityLayer data={orderStatusData}>
                      <CartesianGrid vertical={false} className={gridClass} />
                      <XAxis
                        dataKey="status"
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
                        width={30}
                        allowDecimals={false}
                      />
                      <ChartTooltip content={<ChartTooltipContent />} />
                      <Bar
                        dataKey="count"
                        radius={[6, 6, 0, 0]}
                        style={pointerStyle}
                        {...chartAnim}
                      >
                        {orderStatusData.map((entry) => (
                          <Cell
                            key={entry.status}
                            fill={entry.fill}
                            style={pointerStyle}
                          />
                        ))}
                      </Bar>
                    </BarChart>
                  </ChartContainer>
                </ChartCard>

                {/* Inventory — donut */}
                <ChartCard
                  title="Inventory"
                  description={`${data.totalProducts} products total`}
                >
                  {inventoryData.length === 0 ? (
                    <EmptyChart label="No inventory data yet" />
                  ) : (
                    <ChartContainer
                      config={{ value: { label: "Products" } }}
                      className="h-[240px] w-full"
                    >
                      <PieChart accessibilityLayer>
                        <ChartTooltip
                          content={<ChartTooltipContent nameKey="name" />}
                        />
                        <Pie
                          data={inventoryData}
                          dataKey="value"
                          nameKey="name"
                          innerRadius={55}
                          outerRadius={85}
                          strokeWidth={2}
                          style={pointerStyle}
                          {...chartAnim}
                        >
                          {inventoryData.map((entry) => (
                            <Cell
                              key={entry.name}
                              fill={entry.fill}
                              style={pointerStyle}
                            />
                          ))}
                        </Pie>
                        <ChartLegend
                          content={<ChartLegendContent nameKey="name" />}
                        />
                      </PieChart>
                    </ChartContainer>
                  )}
                </ChartCard>

                {/* Top selling products — horizontal bar */}
                <ChartCard
                  title="Top Selling Products"
                  description="Units sold, most recent period"
                >
                  {topProductsData.length === 0 ? (
                    <EmptyChart label="No sales yet" />
                  ) : (
                    <ChartContainer
                      config={{ sold: { label: "Sold" } }}
                      className="h-[240px] w-full"
                    >
                      <BarChart
                        accessibilityLayer
                        data={topProductsData}
                        layout="vertical"
                        margin={{ left: 8 }}
                      >
                        <CartesianGrid
                          horizontal={false}
                          className={gridClass}
                        />
                        <XAxis
                          type="number"
                          tickLine={false}
                          axisLine={false}
                          tick={axisTick}
                          allowDecimals={false}
                        />
                        <YAxis
                          type="category"
                          dataKey="title"
                          tickLine={false}
                          axisLine={false}
                          width={140}
                          tick={{ ...axisTick, width: 130 }}
                        />
                        <ChartTooltip content={<ChartTooltipContent />} />
                        <Bar
                          dataKey="sold"
                          fill={COLORS.brand}
                          radius={[0, 6, 6, 0]}
                          style={pointerStyle}
                          {...chartAnim}
                        />
                      </BarChart>
                    </ChartContainer>
                  )}
                </ChartCard>

                {/* Customer growth — line */}
                <ChartCard
                  title="Customers"
                  description={`${data.totalCustomers} total customer${data.totalCustomers !== 1 ? "s" : ""}`}
                >
                  {customerGrowthData.length === 0 ? (
                    <EmptyChart label="No customer activity yet" />
                  ) : (
                    <ChartContainer
                      config={{ customers: { label: "Customers" } }}
                      className="h-[240px] w-full"
                    >
                      <LineChart accessibilityLayer data={customerGrowthData}>
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
                          width={30}
                          allowDecimals={false}
                        />
                        <ChartTooltip content={<ChartTooltipContent />} />
                        <Line
                          dataKey="customers"
                          type="monotone"
                          stroke={COLORS.blue}
                          strokeWidth={2.5}
                          dot={{ r: 4, fill: COLORS.blue }}
                          activeDot={{ r: 6 }}
                          style={pointerStyle}
                          {...chartAnim}
                        />
                      </LineChart>
                    </ChartContainer>
                  )}
                </ChartCard>

                {/* Payment methods — pie */}
                <ChartCard
                  title="Payment Methods"
                  description="Share of recent orders"
                >
                  {paymentMethodData.length === 0 ? (
                    <EmptyChart label="No payments yet" />
                  ) : (
                    <ChartContainer
                      config={{ count: { label: "Orders" } }}
                      className="h-[240px] w-full"
                    >
                      <PieChart accessibilityLayer>
                        <ChartTooltip
                          content={<ChartTooltipContent nameKey="method" />}
                        />
                        <Pie
                          data={paymentMethodData}
                          dataKey="count"
                          nameKey="method"
                          outerRadius={85}
                          strokeWidth={2}
                          style={pointerStyle}
                          {...chartAnim}
                        >
                          {paymentMethodData.map((entry) => (
                            <Cell
                              key={entry.method}
                              fill={entry.fill}
                              style={pointerStyle}
                            />
                          ))}
                        </Pie>
                        <ChartLegend
                          content={<ChartLegendContent nameKey="method" />}
                        />
                      </PieChart>
                    </ChartContainer>
                  )}
                </ChartCard>

                {/* Return vs Exchange — donut */}
                <ChartCard
                  title="Returns vs Exchanges"
                  description="Post-delivery requests"
                >
                  {returnExchangeData.length === 0 ? (
                    <EmptyChart label="No returns or exchanges yet" />
                  ) : (
                    <ChartContainer
                      config={{ value: { label: "Requests" } }}
                      className="h-[240px] w-full"
                    >
                      <PieChart accessibilityLayer>
                        <ChartTooltip
                          content={<ChartTooltipContent nameKey="name" />}
                        />
                        <Pie
                          data={returnExchangeData}
                          dataKey="value"
                          nameKey="name"
                          innerRadius={55}
                          outerRadius={85}
                          strokeWidth={2}
                          style={pointerStyle}
                          {...chartAnim}
                        >
                          {returnExchangeData.map((entry) => (
                            <Cell
                              key={entry.name}
                              fill={entry.fill}
                              style={pointerStyle}
                            />
                          ))}
                        </Pie>
                        <ChartLegend
                          content={<ChartLegendContent nameKey="name" />}
                        />
                      </PieChart>
                    </ChartContainer>
                  )}
                </ChartCard>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default SellerAnalytics;
