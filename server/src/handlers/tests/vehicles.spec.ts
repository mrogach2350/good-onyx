import { Request, Response } from "express";
import {
  getVehiclesHandler,
  getVehicleByIdHandler,
  updateVehicleHandler,
  deleteVehicleHandler,
  undoDeleteVehiclesHandler,
} from "../vehicles";
import {
  getAllVehicles,
  getVehicleById,
  updateVehicle,
  deleteVehiclesById,
  reinstateVehiclesById,
} from "../../db/interactions/vehicles";

// Mock the database interactions
jest.mock("../../db/interactions/vehicles", () => ({
  getAllVehicles: jest.fn(),
  getVehicleById: jest.fn(),
  updateVehicle: jest.fn(),
  deleteVehiclesById: jest.fn(),
  reinstateVehiclesById: jest.fn(),
}));

describe("Vehicle Handlers", () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let jsonMock: jest.Mock;

  beforeEach(() => {
    jsonMock = jest.fn();
    mockRequest = {
      body: {},
      params: {},
    };
    mockResponse = {
      json: jsonMock,
    };
    jest.clearAllMocks();
  });

  describe("getVehiclesHandler", () => {
    it("should return all vehicles", async () => {
      const mockVehicles = [
        { id: 1, note: "Vehicle 1" },
        { id: 2, note: "Vehicle 2" },
      ];
      (getAllVehicles as jest.Mock).mockResolvedValueOnce(mockVehicles);

      await getVehiclesHandler(mockRequest as Request, mockResponse as Response);

      expect(getAllVehicles).toHaveBeenCalled();
      expect(jsonMock).toHaveBeenCalledWith({
        vehicles: mockVehicles,
      });
    });
  });

  describe("getVehicleByIdHandler", () => {
    it("should return error for invalid id", async () => {
      mockRequest.params = { id: "0" };

      await getVehicleByIdHandler(mockRequest as Request, mockResponse as Response);

      expect(jsonMock).toHaveBeenCalledWith({
        error: "Error",
        message: "Invalid vehicle id",
      });
    });

    it("should return vehicle for valid id", async () => {
      const mockVehicle = { id: 1, note: "Test Vehicle" };
      mockRequest.params = { id: "1" };
      (getVehicleById as jest.Mock).mockResolvedValueOnce(mockVehicle);

      await getVehicleByIdHandler(mockRequest as Request, mockResponse as Response);

      expect(getVehicleById).toHaveBeenCalledWith(1);
      expect(jsonMock).toHaveBeenCalledWith({
        vehicle: mockVehicle,
      });
    });
  });

  describe("updateVehicleHandler", () => {
    it("should update vehicle successfully", async () => {
      mockRequest.body = { id: 1, note: "Updated note" };
      (updateVehicle as jest.Mock).mockResolvedValueOnce(undefined);

      await updateVehicleHandler(mockRequest as Request, mockResponse as Response);

      expect(updateVehicle).toHaveBeenCalledWith({ id: 1, note: "Updated note" });
      expect(jsonMock).toHaveBeenCalledWith({
        success: true,
        message: "vehicle updated",
      });
    });

    it("should handle update error", async () => {
      mockRequest.body = { id: 1, note: "Updated note" };
      const error = new Error("Update failed");
      (updateVehicle as jest.Mock).mockRejectedValueOnce(error);

      await updateVehicleHandler(mockRequest as Request, mockResponse as Response);

      expect(jsonMock).toHaveBeenCalledWith({
        success: false,
        message: `Error updating vehicle: ${error}`,
      });
    });
  });

  describe("deleteVehicleHandler", () => {
    it("should delete vehicles successfully", async () => {
      const vehicleIds = [1, 2, 3];
      mockRequest.body = { vehicleIds };
      (deleteVehiclesById as jest.Mock).mockResolvedValueOnce(vehicleIds);

      await deleteVehicleHandler(mockRequest as Request, mockResponse as Response);

      expect(deleteVehiclesById).toHaveBeenCalledWith(vehicleIds);
      expect(jsonMock).toHaveBeenCalledWith({
        success: true,
        deleteVehicleIds: vehicleIds,
      });
    });

    it("should handle delete error", async () => {
      mockRequest.body = { vehicleIds: [1, 2, 3] };
      const error = new Error("Delete failed");
      (deleteVehiclesById as jest.Mock).mockRejectedValueOnce(error);

      await deleteVehicleHandler(mockRequest as Request, mockResponse as Response);

      expect(jsonMock).toHaveBeenCalledWith({
        success: false,
        error: error.message,
      });
    });

    it("should handle empty vehicleIds array", async () => {
      mockRequest.body = { vehicleIds: [] };
      (deleteVehiclesById as jest.Mock).mockResolvedValueOnce([]);

      await deleteVehicleHandler(mockRequest as Request, mockResponse as Response);

      expect(deleteVehiclesById).toHaveBeenCalledWith([]);
      expect(jsonMock).toHaveBeenCalledWith({
        success: true,
        deleteVehicleIds: [],
      });
    });
  });

  describe("undoDeleteVehiclesHandler", () => {
    it("should reinstate vehicles successfully", async () => {
      const vehicleIds = [1, 2, 3];
      mockRequest.body = { vehicleIds };
      (reinstateVehiclesById as jest.Mock).mockResolvedValueOnce(vehicleIds);

      await undoDeleteVehiclesHandler(mockRequest as Request, mockResponse as Response);

      expect(reinstateVehiclesById).toHaveBeenCalledWith(vehicleIds);
      expect(jsonMock).toHaveBeenCalledWith({
        success: true,
        reinstatedVehicleIds: vehicleIds,
      });
    });

    it("should handle reinstate error", async () => {
      mockRequest.body = { vehicleIds: [1, 2, 3] };
      const error = new Error("Reinstate failed");
      (reinstateVehiclesById as jest.Mock).mockRejectedValueOnce(error);

      await undoDeleteVehiclesHandler(mockRequest as Request, mockResponse as Response);

      expect(jsonMock).toHaveBeenCalledWith({
        success: false,
        error: error.message,
      });
    });

    it("should handle empty vehicleIds array", async () => {
      mockRequest.body = { vehicleIds: [] };
      (reinstateVehiclesById as jest.Mock).mockResolvedValueOnce([]);

      await undoDeleteVehiclesHandler(mockRequest as Request, mockResponse as Response);

      expect(reinstateVehiclesById).toHaveBeenCalledWith([]);
      expect(jsonMock).toHaveBeenCalledWith({
        success: true,
        reinstatedVehicleIds: [],
      });
    });
  });
});