// packages/core/src/events/DomainEvent.ts
/**
 * Base class for Domain Events.
 * All domain events should extend this class.
 */
export class DomainEvent {
  aggregateId;
  eventType;
  occurredAt;
  constructor(aggregateId, eventType) {
    this.aggregateId = aggregateId;
    this.eventType = eventType;
    this.occurredAt = new Date();
  }
}
export class EventBus {
  static instance;
  handlers = new Map();
  constructor() {}
  static getInstance() {
    if (!EventBus.instance) {
      EventBus.instance = new EventBus();
    }
    return EventBus.instance;
  }
  subscribe(eventType, handler) {
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
  async publish(event) {
    const handlers = this.handlers.get(event.eventType) ?? [];
    await Promise.all(handlers.map((handler) => handler(event)));
  }
  clear() {
    this.handlers.clear();
  }
}
// ─── Concrete Events ─────────────────────────────────────
export class FindingCreatedEvent extends DomainEvent {
  programId;
  riskLevel;
  constructor(findingId, programId, riskLevel) {
    super(findingId, "FindingCreated");
    this.programId = programId;
    this.riskLevel = riskLevel;
  }
}
export class AuditApprovedEvent extends DomainEvent {
  approvedBy;
  versionNumber;
  constructor(programId, approvedBy, versionNumber) {
    super(programId, "AuditApproved");
    this.approvedBy = approvedBy;
    this.versionNumber = versionNumber;
  }
}
export class FindingResolvedEvent extends DomainEvent {
  programId;
  constructor(findingId, programId) {
    super(findingId, "FindingResolved");
    this.programId = programId;
  }
}
