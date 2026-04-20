import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import API from "../../services/api";

// Shared UI Components
import MetricCard from "../../components/shared/MetricCard";
import ContentSection from "../../components/shared/ContentSection";
import SkeletonStructure from "../../components/shared/SkeletonStructure";
import Modal from "../../components/shared/Modal";
import { useToast } from "../../context/ToastContext";

const MarketplaceInventory = () => {
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [transferringId, setTransferringId] = useState(null);
    const [suggestions, setSuggestions] = useState([]);
    const [loadingSuggestions, setLoadingSuggestions] = useState(false);
    const [selectedTargetId, setSelectedTargetId] = useState(null);
    const [transferStatus, setTransferStatus] = useState({ loading: false, error: null });
    const { addToast } = useToast();

    const fetchRecoveries = async () => {
        try {
            setLoading(true);
            const res = await API.get("marketplace/inventory/");
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
            const res = await API.get(`marketplace/inventory/${item.id}/suggestions`);
            setSuggestions(res.data || []);
            if (res.data && res.data.length > 0) {
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
            await API.post(`marketplace/inventory/${transferringId}/transfer`, {
                inventory_id: selectedTargetId
            });
            addToast("Asset successfully integrated into stock! 📦", "success");
            setTransferringId(null);
            fetchRecoveries();
        } catch (err) {
            setTransferStatus({ 
                loading: false, 
                error: err.response?.data?.detail || "Transfer protocol breach. Please retry." 
            });
            addToast("Failed to sort inventory asset", "error");
        }
    };

    const selectedItem = items.find(i => i.id === transferringId);

    const skeletonLayout = [
        { type: 'stack', gap: 3, items: Array(8).fill({ type: 'rect', height: 70, className: "rounded-3xl" }) }
    ];

    return (
        <div className="space-y-8 selection:bg-primary/10 animate-fadeIn">
            {/* HEADER */}
            <div className="flex flex-col lg:flex-row justify-between items-center lg:items-center gap-8 text-center lg:text-left">
                <div>
                    <p className="text-primary text-[10px] sm:text-[10px] font-black uppercase tracking-[0.3em] mb-1">Campaign Resource Logistics</p>
                    <h1 className="text-3xl sm:text-4xl font-outfit font-black text-on_surface tracking-tight">Collection Hub</h1>
                    <p className="text-xs font-bold text-on_surface_variant/60 mt-1">Sorting assets collected from marketplace theaters onto verified stock.</p>
                </div>
                <div className="flex justify-center w-full lg:w-auto">
                    <MetricCard label="Pending Sorting" value={items.length} icon="inventory_2" />
                </div>
            </div>

            {loading ? (
                <SkeletonStructure layout={skeletonLayout} />
            ) : items.length === 0 ? (
                <div className="text-center py-40 bg-surface_high/60 rounded-[3.5rem] border-2 border-dashed border-white/20 shadow-inner">
                    <span className="material-symbols-outlined text-6xl opacity-10 mb-4">move_to_inbox</span>
                    <p className="text-sm font-bold opacity-30 uppercase tracking-widest">Registry Clear: No new recoveries detected</p>
                </div>
            ) : (
                <div className="bg-surface_high/20 backdrop-blur-md rounded-[3.5rem] border border-white/40 overflow-hidden shadow-soft">
                    {/* TABLE HEAD (Desktop) */}
                    <div className="hidden lg:grid grid-cols-12 gap-4 p-8 border-b border-on_surface/5 bg-on_surface/[0.02]">
                        <div className="col-span-1 text-[10px] font-black uppercase tracking-widest opacity-40">Ref ID</div>
                        <div className="col-span-4 text-[10px] font-black uppercase tracking-widest opacity-40">Asset Descriptor</div>
                        <div className="col-span-2 text-[10px] font-black uppercase tracking-widest opacity-40">Quantity</div>
                        <div className="col-span-2 text-[10px] font-black uppercase tracking-widest opacity-40">Timeline</div>
                        <div className="col-span-3 text-right text-[10px] font-black uppercase tracking-widest opacity-40">Operational Logic</div>
                    </div>

                    <div className="divide-y divide-on_surface/5">
                        <AnimatePresence mode="popLayout">
                            {items.map((item, i) => (
                                <motion.div
                                    key={item.id}
                                    layout
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: i * 0.03 }}
                                    className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-center p-4 sm:p-8 hover:bg-white/80 transition-all group"
                                >
                                    {/* ID Card (Visible on mobile/desktop) */}
                                    <div className="col-span-1">
                                        <span className="px-3 py-1 bg-surface_high text-[9px] font-black uppercase tracking-widest rounded-lg border border-on_surface/5 opacity-60">
                                            #{item.id}
                                        </span>
                                    </div>

                                    {/* ASSET NAME */}
                                    <div className="col-span-1 lg:col-span-4 flex items-center gap-4">
                                        <div className="w-10 h-10 bg-on_surface/5 rounded-xl flex items-center justify-center text-on_surface_variant">
                                            <span className="material-symbols-outlined text-sm">package_2</span>
                                        </div>
                                        <h3 className="text-sm font-black text-on_surface group-hover:text-primary transition-colors">{item.item_name}</h3>
                                    </div>

                                    {/* QUANTITY (Desktop) */}
                                    <div className="hidden lg:block lg:col-span-2">
                                        <div className="inline-block text-sm font-black text-primary bg-primary/5 px-4 py-2 rounded-xl border border-primary/10 leading-snug break-words max-w-full">
                                            {item.quantity} {item.unit}
                                        </div>
                                    </div>

                                    {/* TIMELINE (Desktop) */}
                                    <div className="hidden lg:flex lg:col-span-2 items-center gap-2 opacity-60">
                                        <span className="material-symbols-outlined text-sm">schedule</span>
                                        <span className="text-[10px] font-bold uppercase tracking-widest">
                                            {new Date(item.collected_at).toLocaleDateString()}
                                        </span>
                                    </div>

                                    {/* Mobile Consolidated Info */}
                                    <div className="lg:hidden flex justify-between items-center py-2 px-1 border-y border-on_surface/5 my-2 gap-4">
                                        <div className="inline-block text-sm font-black text-primary bg-primary/5 px-3 py-1.5 rounded-lg border border-primary/10 leading-snug break-words flex-1">
                                            {item.quantity} {item.unit}
                                        </div>
                                        <span className="text-[10px] font-bold uppercase tracking-widest opacity-60 text-right whitespace-nowrap">
                                            {new Date(item.collected_at).toLocaleDateString()}
                                        </span>
                                    </div>

                                    {/* ACTIONS */}
                                    <div className="col-span-1 lg:col-span-3 text-right">
                                        <button
                                            onClick={() => openTransferModal(item)}
                                            className="w-full lg:w-auto px-5 py-3 bg-primaryGradient text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-primary/20 hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2 ml-auto"
                                        >
                                            <span className="material-symbols-outlined text-sm">swap_horiz</span>
                                            Sort to Stock
                                        </button>
                                    </div>
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    </div>
                </div>
            )}

            {/* 🤖 INTELLIGENCE SORTING MODAL (Transfer to Stock) */}
            <Modal
                isOpen={!!transferringId}
                onClose={() => !transferStatus.loading && setTransferringId(null)}
                title="Intelligence Sorting"
                maxWidth="max-w-2xl"
            >
                <div className="space-y-10">
                    <p className="text-sm font-bold text-on_surface_variant/60 ml-1">Define merge parameters for tactical inventory integration.</p>

                    <div className="space-y-10">
                        <div>
                            <label className="text-[10px] font-black uppercase tracking-widest text-primary mb-4 block ml-1">Smart Merge Suggestions</label>
                            {loadingSuggestions ? (
                                <div className="space-y-3">
                                    <SkeletonStructure layout={[{type: 'stack', gap: 3, items: Array(2).fill({type: 'rect', height: 80, className: "rounded-3xl"})}]} />
                                </div>
                            ) : suggestions.length === 0 ? (
                                <div className="p-10 bg-surface_high/30 rounded-[2.5rem] text-center border-2 border-dashed border-on_surface/5">
                                    <p className="text-[10px] font-black uppercase tracking-widest opacity-30 italic">No similar identifiers in current stock registry</p>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 gap-3 max-h-[300px] overflow-y-auto custom-scrollbar pr-2">
                                    {suggestions.map(s => (
                                        <button
                                            key={s.id}
                                            onClick={() => setSelectedTargetId(s.id)}
                                            className={`w-full flex items-center justify-between p-6 rounded-3xl border transition-all duration-300 ${
                                                selectedTargetId === s.id
                                                    ? "border-primary bg-primary/5 shadow-xl ring-2 ring-primary/20"
                                                    : "border-on_surface/5 bg-white hover:border-primary/40"
                                            }`}
                                        >
                                            <div className="flex items-center gap-4">
                                                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-colors ${selectedTargetId === s.id ? 'bg-primary text-white' : 'bg-surface_high text-on_surface_variant/40'}`}>
                                                    <span className="material-symbols-outlined">inventory_2</span>
                                                </div>
                                                <div className="text-left">
                                                    <div className="text-sm font-black text-on_surface uppercase">{s.item_name}</div>
                                                    <div className="text-[10px] font-bold text-primary tracking-widest">Similarity Probability: {Math.round(s.score * 100)}%</div>
                                                </div>
                                            </div>
                                            {selectedTargetId === s.id && <span className="material-symbols-outlined text-primary font-black">check_circle</span>}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>

                        <button
                            onClick={() => setSelectedTargetId(null)}
                            className={`w-full flex items-center gap-5 p-6 rounded-3xl border transition-all duration-300 ${
                                selectedTargetId === null
                                    ? "border-primary bg-primary/5 shadow-xl ring-2 ring-primary/20"
                                    : "border-on_surface/5 bg-white hover:border-primary/40"
                            }`}
                        >
                            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-colors ${selectedTargetId === null ? 'bg-primary text-white' : 'bg-surface_high text-on_surface_variant/40'}`}>
                                <span className="material-symbols-outlined">add_box</span>
                            </div>
                            <div className="text-left flex-1">
                                <div className="text-sm font-black text-on_surface uppercase">Tactical Deployment as New Product</div>
                                <div className="text-[10px] font-bold text-on_surface_variant/40 tracking-widest">Initialize separate registry entry for this asset</div>
                            </div>
                            {selectedTargetId === null && <span className="material-symbols-outlined text-primary font-black">check_circle</span>}
                        </button>

                        {transferStatus.error && (
                            <div className="p-5 bg-red-50 text-red-600 text-[10px] font-black uppercase tracking-widest rounded-3xl border border-red-100 flex items-center gap-3">
                                <span className="material-symbols-outlined text-sm font-black">error</span>
                                Protocol Breach: {transferStatus.error}
                            </div>
                        )}

                        <div className="flex gap-6 pt-6 mb-4">
                            <button
                                disabled={transferStatus.loading}
                                onClick={() => setTransferringId(null)}
                                className="flex-1 py-5 bg-surface_high text-on_surface text-[10px] font-black uppercase tracking-widest rounded-[2rem] hover:bg-surface_highest transition-all"
                            >
                                Abort Sort
                            </button>
                            <button
                                disabled={transferStatus.loading}
                                onClick={handleTransfer}
                                className="flex-1 py-5 bg-primaryGradient text-white text-[10px] font-black uppercase tracking-widest rounded-[2rem] hover:shadow-2xl shadow-primary/20 transition-all flex items-center justify-center gap-3"
                            >
                                {transferStatus.loading ? (
                                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                ) : (
                                    <>
                                        <span className="material-symbols-outlined text-lg">check</span>
                                        Authorize Stock Integration
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            </Modal>
        </div>
    );
};

export default MarketplaceInventory;
