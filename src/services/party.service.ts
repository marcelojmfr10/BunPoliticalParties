import { PartiesStore } from "../store/parties.store";
import type { PoliticalParty } from "../types";
import { generateUuid } from "../utils/generate-uuid";

class PartyService {
  private readonly partiesStore: PartiesStore;

  constructor() {
    this.partiesStore = new PartiesStore();
  }

  getAll(): PoliticalParty[] {
    return this.partiesStore.getAll();
  }

  add(name: string, color: string, borderColor: string): PoliticalParty {
    const newParty: PoliticalParty = {
      id: generateUuid(),
      name,
      color,
      borderColor,
      votes: 0,
    };

    this.partiesStore.add(newParty);
    return newParty;
  }

  update(id: string, updates: Partial<PoliticalParty>): PoliticalParty | null {
    const party = this.partiesStore.findById(id);
    if (!party) {
      return null;
    }

    if (updates.name != undefined) {
      party.name = updates.name;
    }
    if (updates.borderColor != undefined) {
      party.borderColor = updates.borderColor;
    }
    if (updates.color != undefined) {
      party.color = updates.color;
    }
    if (updates.votes != undefined) {
      party.votes = updates.votes;
    }

    return party;
  }

  delete(id: string): boolean {
    return this.partiesStore.remove(id);
  }

  incrementVotes(id: string): PoliticalParty | null {
    const party = this.partiesStore.findById(id);
    if (!party) {
      return null;
    }

    party.votes++;
    return party;
  }

  decrementVotes(id: string): PoliticalParty | null {
    const party = this.partiesStore.findById(id);
    if (!party) {
      return null;
    }

    party.votes--;
    return party;
  }
}

export const partyService = new PartyService();
