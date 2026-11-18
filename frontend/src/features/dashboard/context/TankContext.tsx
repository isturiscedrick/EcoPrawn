import {
  createContext,
  useContext,
  useCallback,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import type { DashboardData } from "@/types/api";
import { parseDashboardResponse, parseTankMutationResponse } from "../lib/validate-response";
import {
  isValidNewTank,
  isValidTankId,
  isValidTankPatch,
  mapTank,
  type NewTankInput,
  type Tank,
} from "../lib/tank-model";

export type { NewTankInput, Tank } from "../lib/tank-model";

