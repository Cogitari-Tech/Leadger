// packages/core/src/events/DomainEvent.ts

/**
 * Base class for Domain Events.
 * All domain events should extend this class.
 */
export abstract class DomainEvent {
  public readonly occurredAt: Date;

  constructor(
    public readonly aggregateId: string,
    public readonly eventType: string,
  ) {
    this.occurredAt = new Date();
  }
}

/**
 * In-memory Event Bus for domain event communication
 * between bounded contexts.
 */
type EventHandler = (event: DomainEvent) => void | Promise<void>;

export class EventBus {
  private static instance: EventBus;
  private handlers = new Map<string, EventHandler[]>();

  private constructor() {}

  static getInstance(): EventBus {
    if (!EventBus.instance) {
      EventBus.instance = new EventBus();
    }
    return EventBus.instance;
  }

  subscribe(eventType: string, handler: EventHandler): () => void {
    const existing = this.handlers.get(eventType) ?? [];
    existing.push(handler);
    this.handlers.set(eventType, existing);

    // Return unsubscribe function
    return () => {
      const handlers = this.handlers.get(eventType) ?? [];
      this.handlers.set(
        eventType,
        handlers.filter((h) => h !== handler),
      );
    };
  }

  async publish(event: DomainEvent): Promise<void> {
    const handlers = this.handlers.get(event.eventType) ?? [];
    await Promise.all(handlers.map((handler) => handler(event)));
  }

  clear(): void {
    this.handlers.clear();
  }
}

// ─── Concrete Events ─────────────────────────────────────

export class FindingCreatedEvent extends DomainEvent {
  constructor(
    findingId: string,
    public readonly programId: string,
    public readonly riskLevel: string,
  ) {
    super(findingId, "FindingCreated");
  }
}

export class AuditApprovedEvent extends DomainEvent {
  constructor(
    programId: string,
    public readonly approvedBy: string,
    public readonly versionNumber: number,
  ) {
    super(programId, "AuditApproved");
  }
}

export class FindingResolvedEvent extends DomainEvent {
  constructor(
    findingId: string,
    public readonly programId: string,
  ) {
    super(findingId, "FindingResolved");
  }
}
