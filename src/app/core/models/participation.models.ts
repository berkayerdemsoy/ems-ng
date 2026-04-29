export interface ParticipationCreateDto {
  eventId: number;
  participantEmail: string;
}

export interface ParticipationResponseDto {
  id: number;
  eventId: number;
  eventTitle: string;
  participantId: number;
  participantEmail: string;
  registeredAt: string;
}

