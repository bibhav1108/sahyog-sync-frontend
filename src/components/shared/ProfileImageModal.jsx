import { useState, useCallback, useRef } from 'react';
import { createPortal } from 'react-dom';
import Cropper from 'react-easy-crop';
import { motion, AnimatePresence } from 'framer-motion';
import { getCroppedImg } from "../../utils/imageUtils";
import Modal from "./Modal";

/* 
  🔹 Isolated Crop Component 
  Moving state here prevents the entire modal (header, etc) from 
  re-rendering 60 times/sec during dragging.
*/
const CropStage = ({ image, onComplete, onBack, onSave }) => {
    const [crop, setCrop] = useState({ x: 0, y: 0 });
    const [zoom, setZoom] = useState(1);
    const [pixels, setPixels] = useState(null);

    const onCropComplete = useCallback((_area, areaPixels) => {
        setPixels(areaPixels);
        onComplete(areaPixels);
    }, [onComplete]);

    return (
        <motion.div 
            key="crop"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
        >
            <div className="p-8 border-b border-surface_high flex items-center justify-between">
                <div>
                    <h3 className="text-xl font-outfit font-black text-on_surface tracking-tight">Perfect Your Look</h3>
                    <p className="text-xs text-on_surface_variant">Position your avatar within the circle</p>
                </div>
            </div>

            <div className="relative h-[380px] w-full bg-black flex items-center justify-center overflow-hidden touch-none" style={{ willChange: 'transform' }}>
                <Cropper
                    image={image}
                    crop={crop}
                    zoom={zoom}
                    aspect={1}
                    onCropChange={setCrop}
                    onCropComplete={onCropComplete}
                    onZoomChange={setZoom}
                    cropShape="round"
                    showGrid={false}
                    classes={{ containerClassName: 'transform-gpu' }}
                />
            </div>

            <div className="p-10 space-y-8">
                <div className="space-y-4">
                    <div className="flex justify-between items-end">
                        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-on_surface_variant">Zoom Intensity</span>
                        <span className="text-sm font-outfit font-black text-primary">{Math.round(zoom * 100)}%</span>
                    </div>
                    <input
                        type="range"
                        value={zoom}
                        min={1}
                        max={3}
                        step={0.1}
                        onChange={(e) => setZoom(parseFloat(e.target.value))}
                        className="w-full h-2 bg-surface_high rounded-lg appearance-none cursor-pointer accent-primary"
                    />
                </div>

                <div className="flex gap-4">
                    <button
                        onClick={onBack}
                        className="flex-1 py-4 bg-surface_high text-on_surface_variant rounded-2xl font-bold hover:bg-surface_highest transition-all flex items-center justify-center gap-2"
                    >
                        <span className="material-symbols-outlined text-sm">arrow_back</span>
                        Back
                    </button>
                    <button
                        onClick={() => onSave(pixels)}
                        className="flex-[2] py-4 bg-primaryGradient text-white rounded-2xl font-bold shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2"
                    >
                        <span className="material-symbols-outlined text-sm">verified_user</span>
                        Finalize Avatar
                    </button>
                </div>
            </div>
        </motion.div>
    );
};

const ProfileImageModal = ({ currentImage, onCropComplete, onRemove, onCancel }) => {
    const [step, setStep] = useState('SELECT'); // SELECT or CROP
    const [tempImage, setTempImage] = useState(null);
    const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
    const fileInputRef = useRef(null);

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.addEventListener("load", () => {
            setTempImage(reader.result);
            setStep('CROP');
        });
        reader.readAsDataURL(file);
    };

    const handleSaveCrop = async (pixels = croppedAreaPixels) => {
        try {
            const croppedImageBlob = await getCroppedImg(tempImage, pixels);
            onCropComplete(croppedImageBlob);
        } catch (e) {
            console.error(e);
        }
    };

    return (
        <Modal
            isOpen={true}
            onClose={onCancel}
            title={step === 'SELECT' ? "Modify Profile Avatar" : "Perfect Your Look"}
            maxWidth="max-w-xl"
            className="!p-0"
            showClose={false}
        >
            <div className="relative">
                {/* Hidden Input */}
                <input 
                    type="file" 
                    ref={fileInputRef} 
                    className="hidden" 
                    accept="image/*" 
                    onChange={handleFileChange} 
                />

                <AnimatePresence mode="wait">
                    {step === 'SELECT' ? (
                        <motion.div 
                            key="select"
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 20 }}
                            className="p-10"
                        >
                            <div className="flex justify-between items-center mb-10">
                                <div>
                                    <h3 className="text-2xl font-outfit font-black text-on_surface tracking-tight">Modify Profile Avatar</h3>
                                    <p className="text-xs text-on_surface_variant uppercase font-black tracking-widest opacity-50 font-bold">Identity Management</p>
                                </div>
                                <button onClick={onCancel} className="w-10 h-10 rounded-full bg-surface_high flex items-center justify-center hover:bg-surface_highest transition-all group">
                                    <span className="material-symbols-outlined text-sm group-hover:scale-110">close</span>
                                </button>
                            </div>

                            <div className="grid grid-cols-2 gap-6">
                                {/* REMOVE OPTION */}
                                <button 
                                    onClick={onRemove}
                                    disabled={!currentImage}
                                    className={`flex flex-col items-center justify-center p-8 rounded-3xl border-2 transition-all group
                                        ${!currentImage 
                                            ? "border-dashed border-on_surface_variant/10 opacity-30 cursor-not-allowed" 
                                            : "border-error/10 bg-error/5 hover:border-error/30 hover:bg-error/10 shadow-lg shadow-error/5"}`}
                                >
                                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-4 transition-transform group-hover:scale-110 ${currentImage ? "bg-error text-white shadow-lg shadow-error/20" : "bg-on_surface_variant/10 text-on_surface_variant/40"}`}>
                                        <span className="material-symbols-outlined text-3xl font-black">delete_forever</span>
                                    </div>
                                    <span className={`text-sm font-bold ${currentImage ? "text-error" : "text-on_surface_variant"}`}>Remove Current</span>
                                    <p className="text-[10px] uppercase font-black tracking-tighter mt-1 opacity-50">Revert to default</p>
                                </button>

                                {/* UPLOAD OPTION */}
                                <button 
                                    onClick={() => fileInputRef.current?.click()}
                                    className="flex flex-col items-center justify-center p-8 rounded-3xl border-2 border-primary/10 bg-primary/5 hover:border-primary/30 hover:bg-primary/10 transition-all group shadow-lg shadow-primary/5"
                                >
                                    <div className="w-14 h-14 rounded-2xl bg-primary text-white flex items-center justify-center mb-4 shadow-lg shadow-primary/20 transition-transform group-hover:scale-110">
                                        <span className="material-symbols-outlined text-3xl font-black">add_a_photo</span>
                                    </div>
                                    <span className="text-sm font-bold text-primary">Upload New</span>
                                    <p className="text-[10px] uppercase font-black tracking-tighter mt-1 opacity-50">From local storage</p>
                                </button>
                            </div>

                            <button 
                                onClick={onCancel}
                                className="w-full mt-10 py-4 text-xs font-black uppercase tracking-[0.2em] text-on_surface_variant/60 hover:text-on_surface transition-colors"
                            >
                                Stay as is
                            </button>
                        </motion.div>
                    ) : (
                        <CropStage 
                            image={tempImage}
                            onComplete={setCroppedAreaPixels}
                            onBack={() => setStep('SELECT')}
                            onSave={handleSaveCrop}
                        />
                    )}
                </AnimatePresence>
            </div>
        </Modal>
    );
};

export default ProfileImageModal;
