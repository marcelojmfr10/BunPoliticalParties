import {
  messageSchema,
  type MessageParsed,
} from "../schemas/websocket-message.schema";
import { partyService } from "../services/party.service";
import type { WebSocketMessage, WebSocketResponse } from "../types";

const createErrorResponse = (error: string): WebSocketResponse => {
  return {
    type: "ERROR",
    payload: { error },
  };
};

// handlers específicos
const handleGetParties = (): WebSocketResponse => {
  return {
    type: "PARTIES_LIST",
    payload: partyService.getAll(),
  };
};

const handleUpdateParty = (
  payload: MessageParsed["payload"],
): WebSocketResponse => {
  if (!payload?.id) {
    return createErrorResponse("Party Id is required");
  }

  const updatedParty = partyService.update(payload.id, {
    name: payload.name,
    color: payload.color,
    borderColor: payload.borderColor,
    votes: payload.votes,
  });

  if (!updatedParty) {
    return createErrorResponse(`Party with id ${payload.id} not found`);
  }

  return {
    type: "PARTY_UPDATED",
    payload: updatedParty,
  };
};

const handleDeleteParty = (
  payload: MessageParsed["payload"],
): WebSocketResponse => {
  if (!payload?.id) {
    return createErrorResponse("Party Id is required");
  }

  const deleted = partyService.delete(payload.id);
  if (!deleted) {
    return createErrorResponse(
      `Party with id ${payload.id} not found or can't be deleted`,
    );
  }

  return {
    type: "PARTY_DELETED",
    payload: {
      id: payload.id,
    },
  };
};

const handleAddParty = (
  payload: MessageParsed["payload"],
): WebSocketResponse => {
  if (!payload?.name || !payload?.color || !payload?.borderColor) {
    return createErrorResponse("Name, color and borderColor are required");
  }

  const newParty = partyService.add(
    payload.name,
    payload.color,
    payload.borderColor,
  );

  return {
    type: "PARTY_ADDED",
    payload: newParty,
  };
};

const handleIncrementVotes = (
  payload: MessageParsed["payload"],
): WebSocketResponse => {
  if (!payload?.id) {
    return createErrorResponse("Party Id is required");
  }

  const incrementVotes = partyService.incrementVotes(payload.id);
  if (!incrementVotes) {
    return createErrorResponse(`Party with id ${payload.id} not found`);
  }

  return {
    type: "VOTES_UPDATED",
    payload: incrementVotes,
  };
};

const handleDecrementeVotes = (
  payload: MessageParsed["payload"],
): WebSocketResponse => {
  if (!payload?.id) {
    return createErrorResponse("Party Id is required");
  }

  const decrementeVotes = partyService.decrementVotes(payload.id);
  if (!decrementeVotes) {
    return createErrorResponse(`Party with id ${payload.id} not found`);
  }
  return {
    type: "VOTES_UPDATED",
    payload: decrementeVotes,
  };
};

export const handleMessage = (message: string): WebSocketResponse => {
  try {
    const jsonData: WebSocketMessage = JSON.parse(message);

    const parsedResult = messageSchema.safeParse(jsonData);

    if (!parsedResult.success) {
      const errorMessage = parsedResult.error.issues
        .map((issue) => {
          issue.message;
        })
        .join(", ");
      return createErrorResponse(`Validation error ${errorMessage}`);
    }

    const { type, payload } = parsedResult.data;

    switch (type) {
      case "ADD_PARTY":
        return handleAddParty(payload);
      case "GET_PARTIES":
        return handleGetParties();
      case "UPDATE_PARTY":
        return handleUpdateParty(payload);
      case "DELETE_PARTY":
        return handleDeleteParty(payload);
      case "INCREMENT_VOTES":
        return handleIncrementVotes(payload);
      case "DECREMENT_VOTES":
        return handleDecrementeVotes(payload);

      default:
        return createErrorResponse(`Unknown message type: ${type}`);
    }
  } catch (error) {
    return createErrorResponse(`Validation error`);
  }
};
