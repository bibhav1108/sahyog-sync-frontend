import { useEffect, useState } from "react";
import API from "../../services/api";
import { useToast } from "../../context/ToastContext";
import { motion, AnimatePresence } from "framer-motion";

// Shared UI Components
import MetricCard from "../../components/shared/MetricCard";
import ContentSection from "../../components/shared/ContentSection";
import ActionInput from "../../components/shared/ActionInput";
import SkeletonStructure from "../../components/shared/SkeletonStructure";
import Modal from "../../components/shared/Modal";

const CATEGORY_ICONS = {
  FOOD: "restaurant",
  MEDICAL: "health_and_safety",
  WATER: "water_drop",
  OTHERS: "inventory_2",
  ALL: "grid_view"
};

const Inventory = () => {
  const [items, setItems] = useState([]);
  const { addToast } = useToast();
  const [loading, setLoading] = useState(false);
  const [adding, setAdding] = useState(false);

  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("ALL");
  const [showForm, setShowForm] = useState(false);
  const [formError, setFormError] = useState("");

  const [editingId, setEditingId] = useState(null);
  const [editValue, setEditValue] = useState("");
  const [conflictId, setConflictId] = useState(null);

  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState("");

  const [newItem, setNewItem] = useState({
    item_name: "",
    quantity: "",
    unit: "kilogram",
    category: "OTHERS",
  });

  const fetchInventory = async (showLoading = true) => {
    try {
      if (showLoading) setLoading(true);
      const res = await API.get("/inventory/");
      setItems(res.data || []);
    } finally {
      if (showLoading) setLoading(false);
    }
  };

  useEffect(() => {
    fetchInventory(true);
  }, []);

  const getAvailable = (i) => i.quantity - i.reserved_quantity;

  const filtered = items.filter((i) => {
    if (filter !== "ALL" && i.category !== filter) return false;
    if (search && !i.item_name.toLowerCase().includes(search.toLowerCase()))
      return false;
    return true;
  });

  const total = items.reduce((a, b) => a + Number(b.quantity), 0);
  const reserved = items.reduce((a, b) => a + Number(b.reserved_quantity), 0);

  const inventorySkeletonLayout = [
    { type: 'grid', cols: 3, item: { type: 'rect', height: 140 } },
    { type: 'row', className: "justify-between items-end", cols: [
        { type: 'stack', items: [ { type: 'text', width: 220, height: 32 }, { type: 'text', width: 300, height: 48, className: "mt-4" } ] },
        { type: 'rect', width: 140, height: 56, className: "rounded-2xl" }
    ]},
    { type: 'row', cols: Array(4).fill({ type: 'rect', width: 80, height: 32, className: "rounded-full" }) },
    { type: 'stack', gap: 4, items: Array(6).fill({ type: 'rect', height: 72, className: "rounded-2xl" }) }
  ];

  const handleUpdateQuantity = async (id, newQuantity) => {
    const finalQuantity = Math.max(0, Number(newQuantity));
    setItems((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, quantity: finalQuantity } : item,
      ),
    );

    try {
      await API.patch(`/inventory/${id}`, { quantity: finalQuantity });
      fetchInventory(false);
    } catch (err) {
      const msg = err?.response?.data?.detail || "Update failed";
      setConflictId(id);
      setTimeout(() => setConflictId(null), 3000);
      if (err?.response?.status === 400) addToast(msg, "error");
      fetchInventory(false);
    }
    setEditingId(null);
  };

  const handleAddItem = async (e) => {
    e.preventDefault();
    if (!newItem.item_name || !newItem.quantity || !newItem.unit) {
      setFormError("Please add the details to initiate");
      return;
    }
    setFormError("");
    setAdding(true);
    try {
      await API.post("/inventory/", { ...newItem, quantity: parseFloat(newItem.quantity) });
      setShowForm(false);
      fetchInventory(false);
      setNewItem({ item_name: "", quantity: "", unit: "kilogram", category: "OTHERS" });
      addToast("Item added to inventory! 📦", "success");
    } catch {
      setFormError("Failed to add item. Please try again.");
    } finally {
      setAdding(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    setDeleteError("");
    try {
      await API.delete(`/inventory/${deleteTarget.id}`);
      setDeleteTarget(null);
      fetchInventory(false);
      addToast("Item removed permanently. ✨", "success");
    } catch (err) {
      setDeleteError(err?.response?.data?.detail || "Deletion failed.");
    } finally {
      setDeleting(false);
    }
  };

  if (loading) {
    return <div className="mt-10"><SkeletonStructure layout={inventorySkeletonLayout} /></div>;
  }

  return (
    <div className="space-y-10 selection:bg-primary/10">
      {/* 🔹 STATS GRID */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <MetricCard label="Total Units" value={total} icon="inventory_2" delay="100ms" />
        <MetricCard label="Reserved Count" value={reserved} icon="lock" delay="200ms" />
        <MetricCard label="Net Available" value={total - reserved} icon="check_circle" highlight delay="300ms" />
      </div>

      {/* 🔹 HEADER & CONTROLS */}
      <div className="flex flex-col lg:flex-row justify-between lg:items-end gap-6 animate-fadeIn pb-2">
        <div className="space-y-4 flex-1">
          <div>
            <p className="text-primary text-[10px] font-black uppercase tracking-[0.3em] mb-1">Stock Management</p>
            <h1 className="text-3xl sm:text-4xl font-outfit font-black text-on_surface tracking-tight">NGO Inventory</h1>
          </div>
          <ActionInput placeholder="Filter inventory by name..." value={search} onChange={setSearch} className="max-w-md" />
        </div>

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setShowForm(true)}
          className="bg-primaryGradient text-white px-8 py-4 rounded-[1.5rem] font-bold shadow-lg shadow-primary/20 flex items-center justify-center gap-2"
        >
          <span className="material-symbols-outlined font-black">add</span>
          Add New Stock Item
        </motion.button>
      </div>

      {/* 🔹 CATEGORY FILTERS */}
      <div className="flex gap-2 flex-wrap animate-fadeIn" style={{ animationDelay: '400ms' }}>
        {["ALL", "FOOD", "MEDICAL", "WATER", "OTHERS"].map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-2 border ${
              filter === f 
                ? "bg-primary text-white border-primary shadow-lg shadow-primary/20" 
                : "bg-white text-on_surface_variant border-on_surface/5 hover:border-primary/20"
            }`}
          >
            <span className="material-symbols-outlined text-sm font-black">{CATEGORY_ICONS[f]}</span>
            {f}
          </button>
        ))}
      </div>

      {/* 🔹 INVENTORY TABLE */}
      <ContentSection title="Current Stock Levels" icon="database" delay="500ms">
        <div className="bg-surface_high/60 rounded-[2rem] overflow-hidden border border-white/20 shadow-inner">
          <div className="hidden md:grid grid-cols-7 gap-4 px-6 py-4 text-[10px] font-black uppercase tracking-[0.2em] text-on_surface_variant border-b border-white opacity-60">
            <div className="col-span-2">Resource Name</div>
            <div>Category</div>
            <div className="text-center">Total</div>
            <div className="text-center">Reserved</div>
            <div className="text-center">Available</div>
            <div className="text-right">Manage</div>
          </div>

          <div className="divide-y divide-white/40">
            {filtered.map((i, idx) => {
              const available = getAvailable(i);
              const isLow = available < i.quantity * 0.2;

              return (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.03 }}
                  key={i.id}
                  className="flex flex-col md:grid md:grid-cols-7 gap-4 px-4 sm:px-6 py-5 md:py-4 md:items-center hover:bg-white/60 transition-all group"
                >
                  {/* Name & Category Header (Mobile/Desktop) */}
                  <div className="col-span-2 flex items-center justify-between md:justify-start gap-4">
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center ${
                          isLow ? "bg-error/10 text-error animate-pulse" : "bg-primary/5 text-primary"
                      }`}>
                          <span className="material-symbols-outlined text-[18px] sm:text-[20px] font-black">
                             {CATEGORY_ICONS[i.category] || CATEGORY_ICONS.OTHERS}
                          </span>
                      </div>
                      <div>
                          <p className="font-bold text-on_surface text-sm sm:text-base">{i.item_name}</p>
                          {isLow && <p className="text-[10px] font-black uppercase text-error tracking-[0.1em]">Critically Low</p>}
                      </div>
                    </div>
                    <span className="md:hidden text-[9px] font-black font-outfit px-3 py-1 bg-surface_highest text-on_surface_variant rounded-lg uppercase tracking-wider">
                      {i.category}
                    </span>
                  </div>

                  {/* Category (Desktop Only) */}
                  <div className="hidden md:block">
                     <span className="text-[10px] font-black font-outfit px-3 py-1 bg-surface_highest text-on_surface_variant rounded-lg uppercase tracking-wider">
                      {i.category}
                    </span>
                  </div>

                  {/* Stats Grid (Mobile Labels + Desktop Values) */}
                  <div className="grid grid-cols-3 md:contents gap-4 border-y border-white/40 md:border-none py-4 md:py-0">
                    <div className="flex flex-col md:block items-center">
                      <span className="md:hidden text-[8px] font-black uppercase opacity-40 mb-1">Total</span>
                      {editingId === i.id ? (
                        <input
                          autoFocus
                          type="number"
                          className="w-full md:w-20 px-2 py-1 bg-white rounded-lg outline-none border-2 border-primary/20 text-center font-bold text-sm"
                          value={editValue}
                          onBlur={() => handleUpdateQuantity(i.id, editValue)}
                          onChange={(e) => setEditValue(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") handleUpdateQuantity(i.id, editValue);
                            if (e.key === "Escape") setEditingId(null);
                          }}
                        />
                      ) : (
                        <span className="font-bold text-on_surface">{i.quantity}</span>
                      )}
                    </div>

                    <div className="flex flex-col md:block items-center">
                      <span className="md:hidden text-[8px] font-black uppercase opacity-40 mb-1">Reserved</span>
                      <div className={`font-bold transition-all ${conflictId === i.id ? "text-error scale-125" : "opacity-60"}`}>
                        {i.reserved_quantity}
                      </div>
                    </div>

                    <div className="flex flex-col md:block items-center">
                      <span className="md:hidden text-[8px] font-black uppercase opacity-40 mb-1">Available</span>
                      <div className={`font-black ${isLow ? "text-error" : "text-primary"}`}>
                        {available} <span className="text-[10px] opacity-40 font-bold ml-0.5">{i.unit}</span>
                      </div>
                    </div>
                  </div>

                  {/* Manage Actions */}
                  <div className="flex justify-end gap-2 md:opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => { setEditingId(i.id); setEditValue(i.quantity); }}
                      className="flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2 bg-primary/5 md:bg-transparent hover:bg-primary/10 text-primary rounded-xl transition-colors border border-primary/10 md:border-none"
                    >
                      <span className="material-symbols-outlined text-[18px] sm:text-[20px] font-black">edit_square</span>
                      <span className="md:hidden text-[9px] font-black uppercase tracking-widest">Edit</span>
                    </button>
                    <button
                      onClick={() => setDeleteTarget(i)}
                      className="flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2 bg-error/5 md:bg-transparent hover:bg-error/10 text-error rounded-xl transition-colors border border-error/10 md:border-none"
                    >
                      <span className="material-symbols-outlined text-[18px] sm:text-[20px] font-black">delete</span>
                      <span className="md:hidden text-[9px] font-black uppercase tracking-widest">Delete</span>
                    </button>
                  </div>
                </motion.div>
              );
            })}

            {filtered.length === 0 && (
              <div className="p-12 text-center text-on_surface_variant flex flex-col items-center gap-3">
                <span className="material-symbols-outlined text-4xl opacity-20">inventory_2</span>
                <p className="font-bold opacity-40 uppercase text-xs tracking-[0.2em]">No inventory items match your search</p>
              </div>
            )}
          </div>
        </div>
      </ContentSection>

      {/* 🔹 ADD ITEM MODAL */}
      {/* ADD ITEM MODAL */}
      <Modal
        isOpen={showForm}
        onClose={() => setShowForm(false)}
        title="Register New Stock"
        maxWidth="max-w-md"
      >
        <form onSubmit={handleAddItem} className="space-y-8 mt-2">
            <p className="text-xs font-bold text-on_surface_variant/60 leading-relaxed italic border-l-4 border-primary/20 pl-4 py-1">Initialize new resource assets into the global ledger. Ensure categorization accuracy for logistical precision.</p>

            <div className="space-y-6">
                <ActionInput label="Item Designation" type="text" placeholder="e.g. Paracetamol, Rice Bags..." value={newItem.item_name} onChange={(v) => setNewItem({ ...newItem, item_name: v })} />

                <div className="grid grid-cols-2 gap-6">
                    <ActionInput label="Quantity" type="number" placeholder="0.00" value={newItem.quantity} onChange={(v) => setNewItem({ ...newItem, quantity: v })} />
                    <div className="flex flex-col gap-2">
                        <label className="text-[9px] font-black uppercase tracking-widest text-on_surface_variant/40 ml-1">Asset Unit</label>
                        <select className="px-5 py-3.5 rounded-2xl bg-white border border-on_surface/5 shadow-sm focus:ring-2 focus:ring-primary/20 outline-none text-xs font-black uppercase tracking-widest cursor-pointer" value={newItem.unit} onChange={(e) => setNewItem({ ...newItem, unit: e.target.value })}>
                            <option value="kilogram">Kilograms (kg)</option>
                            <option value="litre">Litres (L)</option>
                            <option value="piece">Pieces (pcs)</option>
                            <option value="box">Boxes</option>
                        </select>
                    </div>
                </div>

                <div>
                    <label className="text-[9px] font-black uppercase tracking-widest text-on_surface_variant/40 ml-1 mb-3 block">Tactical Category</label>
                    <div className="flex gap-2 flex-wrap">
                        {["FOOD", "MEDICAL", "WATER", "OTHERS"].map((cat) => (
                            <button 
                                key={cat} 
                                type="button" 
                                onClick={() => setNewItem({ ...newItem, category: cat })} 
                                className={`px-4 py-3 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all border flex items-center gap-2 ${
                                    newItem.category === cat 
                                        ? "bg-primary text-white border-primary shadow-lg shadow-primary/20" 
                                        : "bg-surface_high/30 text-on_surface_variant/60 border-on_surface/5 hover:border-primary/20"
                                }`}
                            >
                                <span className="material-symbols-outlined text-sm font-black">{CATEGORY_ICONS[cat]}</span>
                                {cat}
                            </button>
                        ))}
                    </div>
                </div>

                {formError && (
                    <div className="p-4 rounded-xl bg-error/5 border border-error/10 text-error text-[10px] font-black uppercase flex items-center gap-3">
                        <span className="material-symbols-outlined text-sm font-black">warning</span>
                        {formError}
                    </div>
                )}

                <div className="flex gap-4 pt-4">
                    <button type="button" onClick={() => setShowForm(false)} className="flex-1 px-4 py-4 rounded-2xl bg-surface_high text-on_surface_variant/60 font-black text-[10px] uppercase tracking-widest hover:bg-surface_highest transition-all">Discard</button>
                    <button type="submit" disabled={adding} className="flex-[2] px-4 py-4 rounded-2xl bg-primaryGradient text-white font-black text-[10px] uppercase tracking-[0.2em] shadow-xl shadow-primary/20 disabled:opacity-50 hover:-translate-y-1 transition-all flex items-center justify-center gap-3">
                        {adding ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <span className="material-symbols-outlined text-sm">inventory_2</span>}
                        {adding ? "Initializing..." : "Authorize Stock"}
                    </button>
                </div>
            </div>
        </form>
      </Modal>

      {/* DELETE CONFIRMATION */}
      <Modal
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        title="Sanitize Stock?"
        maxWidth="max-w-sm"
        showClose={false}
      >
        {deleteTarget && (
            <div className="text-center space-y-6 py-4">
                <div className="w-24 h-24 rounded-[2rem] bg-error/5 text-error flex items-center justify-center mx-auto mb-6 rotate-12 group-hover:rotate-0 transition-transform duration-500 border border-error/10">
                    <span className="material-symbols-outlined text-5xl font-black">delete_forever</span>
                </div>
                <div>
                    <p className="text-sm font-medium text-on_surface_variant/70 leading-relaxed mb-1">Are you sure you want to permanently purge</p>
                    <p className="text-xl font-black text-on_surface tracking-tight uppercase">{deleteTarget.item_name}</p>
                    <p className="text-[10px] font-black uppercase text-error tracking-[0.2em] mt-3 bg-error/5 py-1 px-4 rounded-full inline-block">This action is irreversible</p>
                </div>

                {deleteError && (
                    <div className="p-4 rounded-xl bg-error/5 border border-error/10 text-error text-[10px] font-black uppercase flex items-center justify-center gap-2">
                        <span className="material-symbols-outlined text-sm font-black">warning</span>
                        {deleteError}
                    </div>
                )}

                <div className="flex gap-4 pt-6">
                    <button onClick={() => setDeleteTarget(null)} className="flex-1 px-4 py-4 rounded-2xl bg-surface_high text-on_surface_variant/60 font-black text-[10px] uppercase tracking-widest hover:bg-surface_highest transition-all">Abort</button>
                    <button onClick={handleDeleteConfirm} disabled={deleting} className="flex-1 px-4 py-4 rounded-2xl bg-error text-white font-black text-[10px] uppercase tracking-widest shadow-xl shadow-error/20 hover:scale-105 transition-all disabled:opacity-50">
                        {deleting ? "Purging..." : "Confirm Purge"}
                    </button>
                </div>
            </div>
        )}
      </Modal>
    </div>
  );
};

export default Inventory;
