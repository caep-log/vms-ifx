import { ResponseDTO } from "../dtos/responseDTO";

export class Response {

    static ok(data: unknown, message = "OK"): ResponseDTO {
        return {
            status: 200,
            message,
            data
        };
    }

    static created(data: unknown, message = "Creado correctamente"): ResponseDTO {
        return {
            status: 201,
            message,
            data
        };
    }

    static badRequest(message = "Solicitud inválida"): ResponseDTO {
        return {
            status: 400,
            message,
            data: {}
        };
    }

    static unauthorized(message = "No autorizado"): ResponseDTO {
        return {
            status: 401,
            message,
            data: {}
        };
    }

    static notFound(message = "No encontrado"): ResponseDTO {
        return {
            status: 404,
            message,
            data: {}
        };
    }

    static internalError(message = "Error interno del servidor"): ResponseDTO {
        return {
            status: 500,
            message,
            data: {}
        };
    }
}