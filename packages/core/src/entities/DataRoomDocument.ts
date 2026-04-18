// packages/core/src/entities/DataRoomDocument.ts

export type DocumentCategory =
  | "financial"
  | "legal"
  | "corporate"
  | "technical"
  | "pitch"
  | "general";

/**
 * Domain Entity: Data Room Document
 *
 * Represents a secure document stored in the investor data room.
 * Documents are tenant-scoped and categorized for due diligence workflows.
 */
export class DataRoomDocument {
  private constructor(
    public readonly id: string,
    public readonly tenantId: string,
    public readonly name: string,
    public readonly filePath: string,
    public readonly storageBucket: string,
    public readonly fileSize: number,
    public readonly mimeType: string,
    public readonly category: DocumentCategory,
    public readonly uploadedBy: string | null,
    public readonly description: string | null,
    public readonly createdAt: Date,
    public readonly updatedAt: Date,
  ) {
    this.validate();
  }

  static create(props: {
    tenantId: string;
    name: string;
    filePath: string;
    fileSize: number;
    mimeType: string;
    category?: DocumentCategory;
    uploadedBy: string;
    description?: string;
  }): DataRoomDocument {
    const now = new Date();
    return new DataRoomDocument(
      crypto.randomUUID(),
      props.tenantId,
      props.name,
      props.filePath,
      "data_room",
      props.fileSize,
      props.mimeType,
      props.category ?? "general",
      props.uploadedBy,
      props.description ?? null,
      now,
      now,
    );
  }

  static fromPersistence(data: Record<string, unknown>): DataRoomDocument {
    return new DataRoomDocument(
      data.id as string,
      data.tenant_id as string,
      data.name as string,
      data.file_path as string,
      (data.storage_bucket as string) ?? "data_room",
      Number(data.file_size),
      data.mime_type as string,
      (data.category as DocumentCategory) ?? "general",
      (data.uploaded_by as string) ?? null,
      (data.description as string) ?? null,
      new Date(data.created_at as string),
      new Date(data.updated_at as string),
    );
  }

  toPersistence(): Record<string, unknown> {
    return {
      id: this.id,
      tenant_id: this.tenantId,
      name: this.name,
      file_path: this.filePath,
      storage_bucket: this.storageBucket,
      file_size: this.fileSize,
      mime_type: this.mimeType,
      category: this.category,
      uploaded_by: this.uploadedBy,
      description: this.description,
      created_at: this.createdAt.toISOString(),
      updated_at: this.updatedAt.toISOString(),
    };
  }

  private validate(): void {
    if (!this.name || this.name.trim().length === 0) {
      throw new Error("Document name is required");
    }

    if (this.fileSize <= 0) {
      throw new Error("File size must be positive");
    }

    if (!this.filePath || this.filePath.trim().length === 0) {
      throw new Error("File path is required");
    }

    if (!this.mimeType || this.mimeType.trim().length === 0) {
      throw new Error("MIME type is required");
    }
  }

  /** Max file size: 50MB */
  static readonly MAX_FILE_SIZE = 50 * 1024 * 1024;

  static readonly ALLOWED_MIME_TYPES = [
    "application/pdf",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "application/vnd.openxmlformats-officedocument.presentationml.presentation",
    "text/csv",
    "image/png",
    "image/jpeg",
  ] as const;

  isAllowedMimeType(): boolean {
    return (DataRoomDocument.ALLOWED_MIME_TYPES as readonly string[]).includes(
      this.mimeType,
    );
  }

  exceedsMaxSize(): boolean {
    return this.fileSize > DataRoomDocument.MAX_FILE_SIZE;
  }

  getFormattedSize(): string {
    const units = ["B", "KB", "MB", "GB"];
    let size = this.fileSize;
    let unitIndex = 0;
    while (size >= 1024 && unitIndex < units.length - 1) {
      size /= 1024;
      unitIndex++;
    }
    return `${size.toFixed(1)} ${units[unitIndex]}`;
  }

  /** Generates the storage path: {tenantId}/{category}/{filename} */
  static buildStoragePath(
    tenantId: string,
    category: DocumentCategory,
    fileName: string,
  ): string {
    const sanitized = fileName.replace(/[^a-zA-Z0-9._-]/g, "_");
    const timestamp = Date.now();
    return `${tenantId}/${category}/${timestamp}_${sanitized}`;
  }
}
