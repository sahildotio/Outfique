import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";
import { MAIN_FLOW, getStatusMeta, STATUS_META } from "../page/Seller/SellerOrderDetail";
import StatusBadge from "./StatusBadge";
import { useSellerOrder } from "../hooks/useSellerOrder";

// Mirrors the backend's `workflow` map exactly — keep these in sync.
// If they drift, the dropdown will just offer nothing (safe failure),
// since the backend is the source of truth and will reject anyway.
const WORKFLOW = {
  PENDING: "CONFIRMED",
  CONFIRMED: "PROCESSING",
  PROCESSING: "PACKED",
  PACKED: "SHIPPED",
  SHIPPED: "OUT_FOR_DELIVERY",
  OUT_FOR_DELIVERY: "DELIVERED",
  RETURN_REQUESTED: "RETURNED",
};

// Terminal / side-branch statuses where no further seller action applies.
const TERMINAL = ["DELIVERED", "CANCELLED", "RETURNED", "EXCHANGED"];

const StatusUpdateDropdown = ({
  orderId,
  currentStatus,
  onUpdated, // (updatedOrder) => void
}) => {
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState(null);
    const {handleUpdateSellerOrder} = useSellerOrder()
  const meta = getStatusMeta(currentStatus);
  const nextStatus = WORKFLOW[currentStatus];
  const isTerminal = TERMINAL.includes(currentStatus);

  const handleSelect = async (status) => {
    if (status !== nextStatus || updating) return;
    setUpdating(true);
    setError(null);
    try {
      const updated = await handleUpdateSellerOrder(orderId, status);
      // Adjust to match whatever shape your hook actually resolves —
        // assuming { success, order } like the controller returns.
        
      if (updated) {
        onUpdated(updated);
      } else {
        setError("Couldn't update status.");
      }
    } catch (err) {
      setError(err?.message || "Something went wrong.");
    } finally {
      setUpdating(false);
    }
  };

  // Nothing to advance to — just show the badge, no dropdown affordance.
  if (isTerminal || !nextStatus) {
    return <StatusBadge label={meta.label} color={meta.color} size="lg" />;
  }

  const nextMeta = getStatusMeta(nextStatus);

  return (
    <div className="flex flex-col items-end gap-1.5">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button
            type="button"
            disabled={updating}
            className="cursor-pointer inline-flex items-center gap-2 rounded-full pl-3 pr-2 py-1.5 text-sm font-medium border border-zinc-200 dark:border-white/10 hover:border-zinc-300 dark:hover:border-white/20 transition-colors duration-200 disabled:opacity-60 disabled:cursor-not-allowed"
            style={{ color: meta.color, backgroundColor: `${meta.color}1A` }}
          >
            <span
              className="w-1.5 h-1.5 rounded-full shrink-0"
              style={{ backgroundColor: meta.color }}
            />
            {updating ? "Updating…" : meta.label}
            <i
              className={`ri-arrow-down-s-line text-base ${updating ? "opacity-0" : ""}`}
            />
          </button>
        </DropdownMenuTrigger>

        <DropdownMenuContent align="end" className="w-56">
          <DropdownMenuLabel className="text-xs text-zinc-500 dark:text-zinc-400">
            Update status
          </DropdownMenuLabel>
          <DropdownMenuSeparator />

          {MAIN_FLOW.map((status) => {
            const stepMeta = getStatusMeta(status);
            const currentIdx = MAIN_FLOW.indexOf(currentStatus);
            const stepIdx = MAIN_FLOW.indexOf(status);
            const isPast = stepIdx !== -1 && stepIdx < currentIdx;
            const isCurrent = status === currentStatus;
            const isNext = status === nextStatus;

            return (
              <DropdownMenuItem
                key={status}
                disabled={!isNext}
                onSelect={() => handleSelect(status)}
                className={`flex items-center justify-between gap-2 ${
                  !isNext ? "opacity-50" : ""
                }`}
              >
                <span className="flex items-center gap-2">
                  <i
                    className={`${stepMeta.icon} text-sm`}
                    style={{ color: stepMeta.color }}
                  />
                  {stepMeta.label}
                </span>
                {isCurrent && (
                  <i className="ri-record-circle-line text-xs text-zinc-400" />
                )}
                {isPast && <i className="ri-check-line text-xs text-zinc-400" />}
              </DropdownMenuItem>
            );
          })}

          {currentStatus === "RETURN_REQUESTED" && (
            <DropdownMenuItem onSelect={() => handleSelect("RETURNED")}>
              <span className="flex items-center gap-2">
                <i
                  className={getStatusMeta("RETURNED").icon}
                  style={{ color: getStatusMeta("RETURNED").color }}
                />
                Mark as Returned
              </span>
            </DropdownMenuItem>
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      <AnimatePresence>
        {error && (
          <motion.p
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="text-xs text-[#e63b1f]"
          >
            {error}
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  );
};

export default StatusUpdateDropdown