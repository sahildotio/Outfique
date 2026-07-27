import { useEffect, useMemo, useState } from "react";
import { useParams, useNavigate } from "react-router";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Skeleton } from "@/components/ui/skeleton";
import { useBuyerOrder } from "../../hooks/useBuyerOrder";

// Shared with SellerOrder.jsx / SellerOrderDetail.jsx / ViewAllOrder.jsx —
// worth lifting into one file (e.g. sellerUi.js) once a third page needs
// the same tokens.
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

const formatFullDate = (iso) => {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const formatDateTime = (iso) => {
  if (!iso) return "—";
  return new Date(iso).toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

// ---------------------------------------------------------------------------
// Status → color/icon mapping. Falls back gracefully for any status not
// listed, so an unseen enum value never breaks the badge or timeline dot.
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
  show: { transition: { staggerChildren: 0.07, delayChildren: 0.25 } },
};

const cardVariant = {
  hidden: { opacity: 0, y: 18 },
  show: { opacity: 1, y: 0, transition: { duration: 0.55, ease: easeOut } },
};
const cardVariantReduced = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { duration: 0.4 } },
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
const Card = ({ title, description, children, className = "" }) => {
  const reduceMotion = useReducedMotion();
  return (
    <motion.div
      variants={reduceMotion ? cardVariantReduced : cardVariant}
      className={`rounded-2xl border border-zinc-200 dark:border-white/10 bg-white dark:bg-[#141414] p-5 sm:p-6 ${className}`}
    >
      {(title || description) && (
        <div className="mb-5">
          {title && (
            <h3 className="text-sm font-semibold text-zinc-900 dark:text-white">
              {title}
            </h3>
          )}
          {description && (
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
              {description}
            </p>
          )}
        </div>
      )}
      {children}
    </motion.div>
  );
};

const StatusBadge = ({ label, color, size = "md" }) => (
  <span
    className={`inline-flex items-center gap-1.5 rounded-full font-medium whitespace-nowrap ${
      size === "lg" ? "px-3 py-1.5 text-sm" : "px-2.5 py-1 text-xs"
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

const InfoRow = ({ icon, label, value }) => (
  <div className="flex items-start gap-3 py-2.5">
    <div className="w-8 h-8 rounded-lg bg-zinc-100 dark:bg-white/[0.06] flex items-center justify-center shrink-0">
      <i className={`${icon} text-sm text-zinc-500 dark:text-zinc-400`} />
    </div>
    <div className="min-w-0">
      <p className="text-xs text-zinc-500 dark:text-zinc-400">{label}</p>
      <p className="text-sm font-medium text-zinc-900 dark:text-white truncate">
        {value}
      </p>
    </div>
  </div>
);

const SummaryLine = ({ label, value, emphasize }) => (
  <div className="flex items-center justify-between py-1.5">
    <span
      className={`text-sm ${
        emphasize
          ? "font-semibold text-zinc-900 dark:text-white"
          : "text-zinc-500 dark:text-zinc-400"
      }`}
    >
      {label}
    </span>
    <span
      className={`text-sm ${
        emphasize
          ? "font-semibold text-zinc-900 dark:text-white"
          : "text-zinc-700 dark:text-zinc-300"
      }`}
    >
      {value}
    </span>
  </div>
);

// Animated vertical timeline built from statusHistory — dot pops in, label
// slides in beside it, and the connecting line "draws" downward so the path
// reads top-to-bottom like a real progression (matches the reference image).
const StatusTimeline = ({ history = [] }) => {
  const reduceMotion = useReducedMotion();
  const sorted = useMemo(
    () =>
      [...history].sort(
        (a, b) => new Date(a.updatedAt) - new Date(b.updatedAt),
      ),
    [history],
  );

  if (sorted.length === 0) {
    return (
      <div className="h-24 flex items-center justify-center text-sm text-zinc-400 dark:text-zinc-600">
        No status history yet
      </div>
    );
  }

  return (
    <div className="relative pl-2">
      {sorted.map((step, i) => {
        const meta = getStatusMeta(step.status);
        const isLast = i === sorted.length - 1;
        return (
          <div
            key={step._id || i}
            className="relative flex gap-4 pb-7 last:pb-0"
          >
            {!isLast && (
              <motion.span
                className="absolute left-[15px] top-8 bottom-0 w-px origin-top overflow-hidden"
                initial={reduceMotion ? { scaleY: 1 } : { scaleY: 0 }}
                animate={{ scaleY: 1 }}
                transition={{
                  duration: 0.5,
                  ease: easeOut,
                  delay: 0.4 + i * 0.12,
                }}
              >
                <span className="block w-px h-full bg-zinc-200 dark:bg-white/10" />
              </motion.span>
            )}
            <motion.div
              initial={
                reduceMotion ? { opacity: 0 } : { opacity: 0, scale: 0.5 }
              }
              animate={{ opacity: 1, scale: 1 }}
              transition={{
                duration: 0.4,
                ease: easeLuxury,
                delay: 0.25 + i * 0.12,
              }}
              className="relative w-8 h-8 rounded-full flex items-center justify-center shrink-0 z-10"
              style={{ backgroundColor: `${meta.color}1A` }}
            >
              <i
                className={`${meta.icon} text-sm`}
                style={{ color: meta.color }}
              />
            </motion.div>
            <motion.div
              initial={reduceMotion ? { opacity: 0 } : { opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{
                duration: 0.4,
                ease: easeOut,
                delay: 0.3 + i * 0.12,
              }}
              className="pt-1"
            >
              <p className="text-sm font-medium text-zinc-900 dark:text-white">
                {meta.label}
              </p>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
                {formatDateTime(step.updatedAt)}
              </p>
            </motion.div>
          </div>
        );
      })}
    </div>
  );
};

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------
const BuyerOrderDetail = () => {
  const reduceMotion = useReducedMotion();
  const { orderid } = useParams();
  const navigate = useNavigate();
  const { handleGetDetailBuyerOrder } = useBuyerOrder();

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const res = await handleGetDetailBuyerOrder(orderid);
        setData(res);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [orderid]);

  const statusMeta = data ? getStatusMeta(data.orderStatus) : null;
  const paymentMeta = data ? getPaymentMeta(data.paymentStatus) : null;
  const isNotFound = !loading && !data;
  const canRequestReturn = data?.orderStatus === "DELIVERED" && !data?.request;

  return (
    <div className="min-h-screen bg-white dark:bg-[#0d0d0d] text-zinc-900 dark:text-white transition-colors duration-300 px-6 py-10 md:px-16 md:py-14">
      <AnimatePresence mode="wait">
        {loading ? (
          <motion.div key="loading" {...stateFade}>
            <Skeleton className="h-8 w-40 mb-6 rounded-lg" />
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              <div className="lg:col-span-2 space-y-4">
                <Skeleton className="h-40 rounded-2xl" />
                <Skeleton className="h-64 rounded-2xl" />
              </div>
              <div className="space-y-4">
                <Skeleton className="h-40 rounded-2xl" />
                <Skeleton className="h-32 rounded-2xl" />
              </div>
            </div>
          </motion.div>
        ) : isNotFound ? (
          <motion.div
            key="empty"
            {...stateFade}
            className="min-h-[60vh] flex flex-col items-center justify-center gap-3 text-center"
          >
            <i className="ri-file-search-line text-3xl text-zinc-300 dark:text-white/20" />
            <p className="text-sm text-zinc-500 dark:text-zinc-400">
              This order couldn't be found.
            </p>
            <button
              type="button"
              onClick={() => navigate("/view-orders")}
              className="cursor-pointer text-sm font-medium text-[#e63b1f] hover:underline"
            >
              Back to orders
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
              <button
                type="button"
                onClick={() => navigate("/view-orders")}
                className="cursor-pointer inline-flex items-center gap-1.5 text-xs font-medium text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-colors duration-200 mb-4"
              >
                <i className="ri-arrow-left-line text-sm" />
                Back to orders
              </button>

              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <span className="text-xs font-medium tracking-[0.15em] uppercase text-zinc-500 dark:text-zinc-400">
                    Order
                  </span>
                  <h1 className="mt-2 text-2xl md:text-3xl font-semibold tracking-tight">
                    {data.orderNumber}
                  </h1>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-2">
                    Placed on {formatDateTime(data.createdAt)}
                  </p>
                </div>
                <StatusBadge {...statusMeta} size="lg" />
              </div>
              <div className="mt-6 h-px bg-zinc-200 dark:bg-white/10" />
            </motion.div>

            {/* Content grid */}
            <motion.div
              variants={container}
              initial="hidden"
              animate="show"
              className="grid grid-cols-1 lg:grid-cols-3 gap-4"
            >
              {/* Left column */}
              <div className="lg:col-span-2 space-y-4">
                <Card
                  title="Items"
                  description={`${data.items?.length || 0} item${data.items?.length !== 1 ? "s" : ""} in this order`}
                >
                  <div className="divide-y divide-zinc-100 dark:divide-white/[0.06]">
                    {data.items?.map((item, i) => {
                      const title =
                        typeof item.product === "object" && item.product
                          ? item.product.title
                          : null;
                      return (
                        <div
                          key={i}
                          className="flex items-center justify-between gap-4 py-4 first:pt-0 last:pb-0"
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            <div className="w-11 h-11 rounded-xl bg-zinc-100 dark:bg-white/[0.06] flex items-center justify-center shrink-0">
                              <i className="ri-t-shirt-line text-lg text-zinc-400 dark:text-zinc-500" />
                            </div>
                            <div className="min-w-0">
                              <p className="text-sm font-medium text-zinc-900 dark:text-white truncate">
                                {title || "Product unavailable"}
                              </p>
                              <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
                                Size {item.size} · Qty {item.quantity}
                              </p>
                            </div>
                          </div>
                          <div className="text-right shrink-0">
                            <p className="text-sm font-semibold text-zinc-900 dark:text-white">
                              {formatPrice(item.totalPrice)}
                            </p>
                            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
                              {formatPrice(item.price)} each
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  <div className="mt-4 pt-4 border-t border-zinc-100 dark:border-white/[0.06] space-y-1">
                    <SummaryLine
                      label="Subtotal"
                      value={formatPrice(data.subTotal)}
                    />
                    <SummaryLine
                      label="Shipping"
                      value={
                        data.shippingCharge > 0
                          ? formatPrice(data.shippingCharge)
                          : "Free"
                      }
                    />
                    {data.discount > 0 && (
                      <SummaryLine
                        label="Discount"
                        value={`− ${formatPrice(data.discount)}`}
                      />
                    )}
                    <div className="pt-1.5 mt-1.5 border-t border-zinc-100 dark:border-white/[0.06]">
                      <SummaryLine
                        label="Total"
                        value={formatPrice(data.totalAmount)}
                        emphasize
                      />
                    </div>
                  </div>

                  {canRequestReturn && (
                    <div className="mt-5 pt-5 border-t border-zinc-100 dark:border-white/[0.06]">
                      <button
                        type="button"
                        onClick={() => navigate(`/orders/${orderid}/request`)}
                        className="cursor-pointer w-full sm:w-auto rounded-xl px-5 py-2.5 text-sm font-medium border border-zinc-200 dark:border-white/10 text-zinc-900 dark:text-white transition-colors duration-300 hover:bg-zinc-50 dark:hover:bg-white/[0.06]"
                      >
                        Request return / exchange
                      </button>
                    </div>
                  )}
                </Card>

                <Card
                  title="Order timeline"
                  description={
                    data.orderStatus === "DELIVERED"
                      ? `Delivered ${formatDateTime(data.deliveredAt)}`
                      : data.estimatedDeliveryDate
                        ? `Estimated delivery ${formatFullDate(data.estimatedDeliveryDate)}`
                        : undefined
                  }
                >
                  <StatusTimeline history={data.statusHistory} />
                </Card>
              </div>

              {/* Right column */}
              <div className="space-y-4">
                <Card title="Payment">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs text-zinc-500 dark:text-zinc-400">
                      {data.paymentMethod}
                    </span>
                    <StatusBadge {...paymentMeta} />
                  </div>
                </Card>

                <Card title="Delivery">
                  <InfoRow
                    icon="ri-calendar-check-line"
                    label="Estimated delivery"
                    value={formatFullDate(data.estimatedDeliveryDate)}
                  />
                  {data.deliveredAt && (
                    <InfoRow
                      icon="ri-checkbox-circle-line"
                      label="Delivered on"
                      value={formatDateTime(data.deliveredAt)}
                    />
                  )}
                </Card>

                {data.request && (
                  <Card title="Return / Exchange request">
                    <InfoRow
                      icon="ri-refund-2-line"
                      label="Type"
                      value={
                        data.request.type === "RETURN" ? "Return" : "Exchange"
                      }
                    />
                    <InfoRow
                      icon="ri-file-text-line"
                      label="Reason"
                      value={data.request.reason}
                    />
                    <div className="flex items-center justify-between py-2.5">
                      <span className="text-xs text-zinc-500 dark:text-zinc-400">
                        Status
                      </span>
                      <StatusBadge
                        label={data.request.status}
                        color={
                          data.request.status === "APPROVED"
                            ? COLORS.emerald
                            : data.request.status === "REJECTED"
                              ? COLORS.brand
                              : COLORS.amber
                        }
                      />
                    </div>
                  </Card>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default BuyerOrderDetail;
