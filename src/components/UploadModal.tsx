import { useState, useRef, useEffect } from "react";
import { Input } from "@base-ui/react/input";
import { Dialog } from "./Dialog";
import { Button } from "./Button";

interface Props {
    isOpen: boolean;
    onClose: () => void;
    onUpload: (files: File[], apiKey: string) => Promise<void>;
    onSaveApiKey?: (apiKey: string) => Promise<void>;
    hasStoredKey: boolean;
    pendingFiles: File[];
    configureKeyOnly?: boolean;
}

export function UploadModal({
    isOpen,
    onClose,
    onUpload,
    onSaveApiKey,
    hasStoredKey,
    pendingFiles,
    configureKeyOnly,
}: Props) {
    const [apiKey, setApiKey] = useState("");
    const [files, setFiles] = useState<File[]>([]);
    const [isDragging, setIsDragging] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const activeFiles = pendingFiles.length > 0 ? pendingFiles : files;
    const needsApiKey = !hasStoredKey && !apiKey.trim();
    const showFileUpload = pendingFiles.length === 0 && !configureKeyOnly;

    useEffect(() => {
        if (!isOpen) {
            setFiles([]);
            setApiKey("");
            setError(null);
        }
    }, [isOpen]);

    function handleDragOver(e: React.DragEvent) {
        e.preventDefault();
        setIsDragging(true);
    }

    function handleDragLeave(e: React.DragEvent) {
        e.preventDefault();
        setIsDragging(false);
    }

    function handleDrop(e: React.DragEvent) {
        e.preventDefault();
        setIsDragging(false);
        setError(null);

        const droppedFiles = Array.from(e.dataTransfer.files).filter(
            (f) => f.type === "application/pdf",
        );
        if (droppedFiles.length > 0) {
            setFiles((prev) => [...prev, ...droppedFiles]);
        } else {
            setError("PDF 파일을 업로드해주세요");
        }
    }

    function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
        setError(null);
        const selectedFiles = Array.from(e.target.files || []).filter(
            (f) => f.type === "application/pdf",
        );
        if (selectedFiles.length > 0) {
            setFiles((prev) => [...prev, ...selectedFiles]);
        } else if (e.target.files?.length) {
            setError("PDF 파일을 업로드해주세요");
        }
    }

    async function handleSubmit() {
        if (configureKeyOnly) {
            if (!apiKey.trim()) {
                setError("API 키를 입력해주세요");
                return;
            }
            setIsLoading(true);
            setError(null);
            try {
                await onSaveApiKey?.(apiKey.trim());
                setApiKey("");
                onClose();
            } catch (err) {
                setError(
                    err instanceof Error
                        ? err.message
                        : "API 키 저장에 실패했습니다",
                );
            } finally {
                setIsLoading(false);
            }
            return;
        }

        if (needsApiKey) {
            setError("API 키를 입력해주세요");
            return;
        }
        if (activeFiles.length === 0) {
            setError("최소 하나의 PDF 파일을 선택해주세요");
            return;
        }

        setIsLoading(true);
        setError(null);

        try {
            await onUpload(activeFiles, apiKey.trim());
            setFiles([]);
            setApiKey("");
            onClose();
        } catch (err) {
            setError(
                err instanceof Error ? err.message : "PDF 처리에 실패했습니다",
            );
        } finally {
            setIsLoading(false);
        }
    }

    function handleClose() {
        if (!isLoading) {
            setFiles([]);
            setApiKey("");
            setError(null);
            onClose();
        }
    }

    const title = configureKeyOnly
        ? "API 키"
        : pendingFiles.length > 0
          ? "API 키 입력"
          : "연말정산 서류 업로드";

    return (
        <Dialog
            open={isOpen}
            onClose={handleClose}
            title={title}
            closeDisabled={isLoading}
        >
            {/* Pending files indicator */}
            {pendingFiles.length > 0 && (
                <div className="mb-4 text-sm">
                    <div className="text-(--color-text-muted)">
                        {pendingFiles.length}개 파일 선택됨
                    </div>
                    <div className="text-xs text-(--color-text-muted) mt-1">
                        {pendingFiles.map((f, i) => (
                            <div key={i} className="truncate">
                                {f.name}
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* API Key input */}
            {(!hasStoredKey || configureKeyOnly) && (
                <div className="mb-4">
                    <label className="block text-xs text-(--color-text-muted) mb-1.5">
                        Anthropic API 키
                    </label>
                    <Input
                        type="password"
                        value={apiKey}
                        onChange={(e) => setApiKey(e.target.value)}
                        placeholder="sk-ant-..."
                        disabled={isLoading}
                        autoComplete="off"
                        data-1p-ignore
                        data-lpignore="true"
                        className="w-full px-3 py-2 border border-(--color-border) bg-(--color-bg-muted) rounded-lg text-sm placeholder:text-(--color-text-muted) focus:outline-none focus:border-(--color-text-muted) disabled:opacity-50"
                    />
                    <p className="text-xs text-(--color-text-muted) mt-1.5">
                        로컬 .env 파일에 저장됩니다
                    </p>
                </div>
            )}

            {/* File upload area */}
            {showFileUpload && (
                <div
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    onClick={() =>
                        !isLoading && fileInputRef.current?.click()
                    }
                    className={[
                        "border border-dashed rounded-xl p-6 text-center cursor-pointer text-sm transition-colors",
                        isDragging
                            ? "border-(--color-text-muted) bg-(--color-bg-muted)"
                            : "border-(--color-border) hover:border-(--color-text-muted)",
                        isLoading ? "opacity-50 cursor-not-allowed" : "",
                    ].join(" ")}
                >
                    <input
                        ref={fileInputRef}
                        type="file"
                        accept=".pdf"
                        multiple
                        onChange={handleFileSelect}
                        disabled={isLoading}
                        className="hidden"
                    />
                    {files.length > 0 ? (
                        <div>
                            <div>
                                {files.length}개 파일 선택됨
                            </div>
                            <div className="text-xs text-(--color-text-muted) mt-1">
                                {files.map((f, i) => (
                                    <div key={i} className="truncate">
                                        {f.name}
                                    </div>
                                ))}
                            </div>
                        </div>
                    ) : (
                        <div className="text-(--color-text-muted)">
                            PDF 파일을 여기에 놓거나 클릭하여 선택
                        </div>
                    )}
                </div>
            )}

            {/* Error message */}
            {error && (
                <div className="mt-4 text-sm text-(--color-negative)">
                    {error}
                </div>
            )}

            {/* Privacy note */}
            {!configureKeyOnly && (
                <div className="mt-4 text-xs text-(--color-text-muted)">
                    연말정산 서류는 Anthropic API로 직접 전송됩니다. 데이터는
                    로컬에 저장됩니다.
                </div>
            )}

            {/* Submit button */}
            <Button
                onClick={handleSubmit}
                disabled={
                    isLoading ||
                    (configureKeyOnly
                        ? !apiKey.trim()
                        : needsApiKey || activeFiles.length === 0)
                }
                className="mt-4 w-full"
            >
                {isLoading
                    ? configureKeyOnly
                        ? "저장 중..."
                        : "처리 중..."
                    : configureKeyOnly
                      ? "API 키 저장"
                      : `연말정산 서류 ${activeFiles.length > 1 ? `${activeFiles.length}개 ` : ""}처리`}
            </Button>
        </Dialog>
    );
}
