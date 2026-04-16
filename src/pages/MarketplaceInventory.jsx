import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import API from "../services/api";
import Skeleton from "../components/Skeleton";

const MarketplaceInventory = () => {
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [transferringId, setTransferringId] = useState(null);
    const [suggestions, setSuggestions] = useState([]);
    const [loadingSuggestions, setLoadingSuggestions] = useState(false);
    const [selectedTargetId, setSelectedTargetId] = useState(null);
    const [transferStatus, setTransferStatus] = useState({ loading: false, error: null });

    const fetchRecoveries = async () => {
        setLoading(true);
        try {
            const res = await API.get("/marketplace-inventory/");
            setItems(res.data || []);
        } catch (err) {
            console.error("Failed to fetch recovery items", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchRecoveries();
    }, []);

    const openTransferModal = async (item) => {
        setTransferringId(item.id);
        setLoadingSuggestions(true);
        setSelectedTargetId(null);
        setTransferStatus({ loading: false, error: null });
        try {
            const res = await API.get(`/marketplace-inventory/${item.id}/suggestions`);
            setSuggestions(res.data || []);
            if (res.data && res.data.length > 0) {
                // Pre-select the best match if score is very high, otherwise leave empty
                if (res.data[0].score > 0.8) {
                    setSelectedTargetId(res.data[0].id);
                }
            }
        } catch (err) {
            console.error("Failed to fetch suggestions", err);
        } finally {
            setLoadingSuggestions(false);
        }
    };

    const handleTransfer = async () => {
        if (!transferringId) return;
        setTransferStatus({ loading: true, error: null });
        try {
            await API.post(`/marketplace-inventory/${transferringId}/transfer`, {
                inventory_id: selectedTargetId // null means "Add as New"
            });
            setTransferringId(null);
            fetchRecoveries();
        } catch (err) {
            setTransferStatus({ 
                loading: false, 
                error: err.response?.data?.detail || "Transfer failed. Please try again." 
            });
        }
    };

    const selectedItem = items.find(i => i.id === transferringId);

    return (
        <div className="space-y-8 animate-[fadeIn_0.5s_ease]">
            <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-outfit font-black tracking-tight">Recovery Hub</h1>
                    <p className="text-sm text-on_surface_variant">Resources collected from marketplace missions awaiting sorting.</p>
                </div>
                <div className="bg-primary/10 px-4 py-2 rounded-2xl flex items-center gap-2 border border-primary/20">
                    <span className="material-symbols-outlined text-primary">inventory</span>
                    <span className="text-xs font-black text-primary uppercase tracking-widest">{items.length} Items Pending</span>
                </div>
            </header>

            {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <Skeleton count={6} height={192} className="rounded-3xl" containerClassName="contents" />
                </div>
            ) : items.length === 0 ? (
                <div className="bg-surface_high/50 border-2 border-dashed border-surface_highest rounded-[2.5rem] p-20 text-center">
                    <div className="w-20 h-20 bg-surface_highest rounded-full flex items-center justify-center mx-auto mb-6 text-on_surface_variant/30">
                        <span className="material-symbols-outlined text-4xl">move_to_inbox</span>
                    </div>
                    <h3 className="text-lg font-bold">Registry Clear</h3>
                    <p className="text-sm text-on_surface_variant">No new recoveries found. Items from completed missions appear here.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <AnimatePresence>
                        {items.map((item) => (
                            <motion.div
                                key={item.id}
                                layout
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.8 }}
                                className="bg-white p-6 rounded-[2rem] border border-surface_highest shadow-soft hover:shadow-lg transition-all group"
                            >
                                <div className="flex justify-between items-start mb-4">
                                    <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-all">
                                        <span className="material-symbols-outlined">package_2</span>
                                    </div>
                                    <div className="text-[10px] font-black text-on_surface_variant uppercase tracking-widest bg-surface_lowest px-3 py-1 rounded-full">
                                        REC #{item.id}
                                    </div>
                                </div>
                                <h3 className="text-xl font-black text-on_surface mb-1">{item.item_name}</h3>
                                <div className="flex items-center gap-2 text-primary font-black text-sm mb-4">
                                    {item.quantity} {item.unit}
                                </div>
                                <div className="text-[10px] text-on_surface_variant italic mb-6">
                                    Collected: {new Date(item.collected_at).toLocaleString()}
                                </div>
                                <button
                                    onClick={() => openTransferModal(item)}
                                    className="w-full py-4 bg-surface_lowest text-on_surface font-black text-xs uppercase tracking-widest rounded-2xl hover:bg-primary hover:text-white transition-all flex items-center justify-center gap-2"
                                >
                                    <span className="material-symbols-outlined text-sm">swap_horiz</span>
                                    Sort into Stock
                                </button>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </div>
            )}

            {/* Transfer Modal */}
            <AnimatePresence>
                {transferringId && (
                    <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="absolute inset-0 bg-black/60 backdrop-blur-md"
                            onClick={() => !transferStatus.loading && setTransferringId(null)}
                        />
                        <motion.div
                            initial={{ y: 20, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            exit={{ y: 20, opacity: 0 }}
                            className="relative w-full max-w-lg bg-white rounded-[2.5rem] shadow-2xl overflow-hidden p-8"
                        >
                            <h2 className="text-2xl font-outfit font-black mb-1">Intelligence Sorting</h2>
                            <p className="text-sm text-on_surface_variant mb-8">Choose how to merge "{selectedItem?.item_name}" into your main inventory.</p>

                            <div className="space-y-6">
                                {/* Suggestion List */}
                                <div>
                                    <label className="text-[10px] font-black uppercase tracking-widest text-on_surface_variant mb-3 block">Smart Suggestions</label>
                                    {loadingSuggestions ? (
                                        <div className="space-y-2">
                                            <Skeleton className="h-12 w-full rounded-xl" />
                                            <Skeleton className="h-12 w-full rounded-xl" />
                                        </div>
                                    ) : suggestions.length === 0 ? (
                                        <div className="p-4 bg-surface_lowest rounded-2xl text-xs text-on_surface_variant italic border border-dashed border-surface_highest">
                                            No similar items found in your main inventory.
                                        </div>
                                    ) : (
                                        <div className="grid grid-cols-1 gap-2 max-h-60 overflow-y-auto pr-2">
                                            {suggestions.map(s => (
                                                <button
                                                    key={s.id}
                                                    onClick={() => setSelectedTargetId(s.id)}
                                                    className={`w-full flex items-center justify-between p-4 rounded-2xl border-2 transition-all text-left ${
                                                        selectedTargetId === s.id
                                                            ? "border-primary bg-primary/5 shadow-md"
                                                            : "border-surface_highest bg-white hover:border-primary/30"
                                                    }`}
                                                >
                                                    <div className="flex items-center gap-3">
                                                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${selectedTargetId === s.id ? 'bg-primary text-white' : 'bg-surface_highest text-on_surface_variant'}`}>
                                                            <span className="material-symbols-outlined text-sm">inventory_2</span>
                                                        </div>
                                                        <div>
                                                            <div className="text-sm font-bold">{s.item_name}</div>
                                                            <div className="text-[10px] text-on_surface_variant">Similarity: {Math.round(s.score * 100)}%</div>
                                                        </div>
                                                    </div>
                                                    {selectedTargetId === s.id && <span className="material-symbols-outlined text-primary">check_circle</span>}
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                {/* "Add as New" Option */}
                                <button
                                    onClick={() => setSelectedTargetId(null)}
                                    className={`w-full flex items-center gap-3 p-4 rounded-2xl border-2 transition-all ${
                                        selectedTargetId === null
                                            ? "border-primary bg-primary/5 shadow-md"
                                            : "border-surface_highest bg-white hover:border-primary/30"
                                    }`}
                                >
                                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${selectedTargetId === null ? 'bg-primary text-white' : 'bg-surface_highest text-on_surface_variant'}`}>
                                        <span className="material-symbols-outlined text-sm">add_box</span>
                                    </div>
                                    <div className="text-left">
                                        <div className="text-sm font-bold">Add as New Product</div>
                                        <div className="text-[10px] text-on_surface_variant">Create a separate registry entry</div>
                                    </div>
                                    {selectedTargetId === null && <span className="ml-auto material-symbols-outlined text-primary">check_circle</span>}
                                </button>

                                {transferStatus.error && (
                                    <div className="p-4 bg-red-50 text-red-500 text-xs font-bold rounded-2xl border border-red-100 italic">
                                        Error: {transferStatus.error}
                                    </div>
                                )}

                                <div className="flex gap-3 pt-4">
                                    <button
                                        disabled={transferStatus.loading}
                                        onClick={() => setTransferringId(null)}
                                        className="flex-1 py-4 bg-surface_lowest text-on_surface_variant font-black text-xs uppercase tracking-widest rounded-2xl hover:bg-surface_highest transition-all"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        disabled={transferStatus.loading}
                                        onClick={handleTransfer}
                                        className="flex-1 py-4 bg-primary text-white font-black text-xs uppercase tracking-widest rounded-2xl hover:shadow-lg shadow-primary/20 transition-all flex items-center justify-center gap-2"
                                    >
                                        {transferStatus.loading ? (
                                            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                        ) : (
                                            <>
                                                <span className="material-symbols-outlined text-sm">check</span>
                                                Confirm Sort
                                            </>
                                        )}
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default MarketplaceInventory;
