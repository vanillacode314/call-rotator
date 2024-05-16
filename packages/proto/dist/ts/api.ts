// @generated by protobuf-ts 2.9.4
// @generated from protobuf file "api.proto" (syntax proto3)
// tslint:disable
import type { BinaryWriteOptions } from "@protobuf-ts/runtime";
import type { IBinaryWriter } from "@protobuf-ts/runtime";
import { WireType } from "@protobuf-ts/runtime";
import type { BinaryReadOptions } from "@protobuf-ts/runtime";
import type { IBinaryReader } from "@protobuf-ts/runtime";
import { UnknownFieldHandler } from "@protobuf-ts/runtime";
import type { PartialMessage } from "@protobuf-ts/runtime";
import { reflectionMergePartial } from "@protobuf-ts/runtime";
import { MessageType } from "@protobuf-ts/runtime";
/**
 * @generated from protobuf message Issue
 */
export interface Issue {
    /**
     * @generated from protobuf field: ApiErrorCode code = 1;
     */
    code: ApiErrorCode;
    /**
     * @generated from protobuf field: string message = 2;
     */
    message: string;
}
/**
 * @generated from protobuf message ApiError
 */
export interface ApiError {
    /**
     * @generated from protobuf field: repeated Issue issues = 1;
     */
    issues: Issue[];
}
/**
 * @generated from protobuf message ErrorResponseV1
 */
export interface ErrorResponseV1 {
    /**
     * @generated from protobuf oneof: result
     */
    result: {
        oneofKind: "error";
        /**
         * @generated from protobuf field: ApiError error = 1;
         */
        error: ApiError;
    } | {
        oneofKind: undefined;
    };
    /**
     * @generated from protobuf field: int32 status = 2;
     */
    status: number;
}
/**
 * @generated from protobuf enum ApiErrorCode
 */
export enum ApiErrorCode {
    /**
     * @generated from protobuf enum value: ERROR_UNSPECIFIED = 0;
     */
    ERROR_UNSPECIFIED = 0,
    /**
     * @generated from protobuf enum value: INVALID_CREDENTIALS = 1;
     */
    INVALID_CREDENTIALS = 1,
    /**
     * @generated from protobuf enum value: INVALID_FORMDATA = 2;
     */
    INVALID_FORMDATA = 2,
    /**
     * @generated from protobuf enum value: INVALID_QUERY = 3;
     */
    INVALID_QUERY = 3,
    /**
     * @generated from protobuf enum value: EMAIL_ALREADY_REGISTERED = 4;
     */
    EMAIL_ALREADY_REGISTERED = 4,
    /**
     * @generated from protobuf enum value: NOT_FOUND = 5;
     */
    NOT_FOUND = 5,
    /**
     * @generated from protobuf enum value: INVALID_PATH = 6;
     */
    INVALID_PATH = 6,
    /**
     * @generated from protobuf enum value: CONFLICT = 7;
     */
    CONFLICT = 7,
    /**
     * @generated from protobuf enum value: INTERNAL_SERVER_ERROR = 8;
     */
    INTERNAL_SERVER_ERROR = 8,
    /**
     * @generated from protobuf enum value: UNAUTHORIZED = 9;
     */
    UNAUTHORIZED = 9,
    /**
     * @generated from protobuf enum value: BAD_REQUEST = 10;
     */
    BAD_REQUEST = 10
}
// @generated message type with reflection information, may provide speed optimized methods
class Issue$Type extends MessageType<Issue> {
    constructor() {
        super("Issue", [
            { no: 1, name: "code", kind: "enum", T: () => ["ApiErrorCode", ApiErrorCode] },
            { no: 2, name: "message", kind: "scalar", T: 9 /*ScalarType.STRING*/ }
        ]);
    }
    create(value?: PartialMessage<Issue>): Issue {
        const message = globalThis.Object.create((this.messagePrototype!));
        message.code = 0;
        message.message = "";
        if (value !== undefined)
            reflectionMergePartial<Issue>(this, message, value);
        return message;
    }
    internalBinaryRead(reader: IBinaryReader, length: number, options: BinaryReadOptions, target?: Issue): Issue {
        let message = target ?? this.create(), end = reader.pos + length;
        while (reader.pos < end) {
            let [fieldNo, wireType] = reader.tag();
            switch (fieldNo) {
                case /* ApiErrorCode code */ 1:
                    message.code = reader.int32();
                    break;
                case /* string message */ 2:
                    message.message = reader.string();
                    break;
                default:
                    let u = options.readUnknownField;
                    if (u === "throw")
                        throw new globalThis.Error(`Unknown field ${fieldNo} (wire type ${wireType}) for ${this.typeName}`);
                    let d = reader.skip(wireType);
                    if (u !== false)
                        (u === true ? UnknownFieldHandler.onRead : u)(this.typeName, message, fieldNo, wireType, d);
            }
        }
        return message;
    }
    internalBinaryWrite(message: Issue, writer: IBinaryWriter, options: BinaryWriteOptions): IBinaryWriter {
        /* ApiErrorCode code = 1; */
        if (message.code !== 0)
            writer.tag(1, WireType.Varint).int32(message.code);
        /* string message = 2; */
        if (message.message !== "")
            writer.tag(2, WireType.LengthDelimited).string(message.message);
        let u = options.writeUnknownFields;
        if (u !== false)
            (u == true ? UnknownFieldHandler.onWrite : u)(this.typeName, message, writer);
        return writer;
    }
}
/**
 * @generated MessageType for protobuf message Issue
 */
export const Issue = new Issue$Type();
// @generated message type with reflection information, may provide speed optimized methods
class ApiError$Type extends MessageType<ApiError> {
    constructor() {
        super("ApiError", [
            { no: 1, name: "issues", kind: "message", repeat: 1 /*RepeatType.PACKED*/, T: () => Issue }
        ]);
    }
    create(value?: PartialMessage<ApiError>): ApiError {
        const message = globalThis.Object.create((this.messagePrototype!));
        message.issues = [];
        if (value !== undefined)
            reflectionMergePartial<ApiError>(this, message, value);
        return message;
    }
    internalBinaryRead(reader: IBinaryReader, length: number, options: BinaryReadOptions, target?: ApiError): ApiError {
        let message = target ?? this.create(), end = reader.pos + length;
        while (reader.pos < end) {
            let [fieldNo, wireType] = reader.tag();
            switch (fieldNo) {
                case /* repeated Issue issues */ 1:
                    message.issues.push(Issue.internalBinaryRead(reader, reader.uint32(), options));
                    break;
                default:
                    let u = options.readUnknownField;
                    if (u === "throw")
                        throw new globalThis.Error(`Unknown field ${fieldNo} (wire type ${wireType}) for ${this.typeName}`);
                    let d = reader.skip(wireType);
                    if (u !== false)
                        (u === true ? UnknownFieldHandler.onRead : u)(this.typeName, message, fieldNo, wireType, d);
            }
        }
        return message;
    }
    internalBinaryWrite(message: ApiError, writer: IBinaryWriter, options: BinaryWriteOptions): IBinaryWriter {
        /* repeated Issue issues = 1; */
        for (let i = 0; i < message.issues.length; i++)
            Issue.internalBinaryWrite(message.issues[i], writer.tag(1, WireType.LengthDelimited).fork(), options).join();
        let u = options.writeUnknownFields;
        if (u !== false)
            (u == true ? UnknownFieldHandler.onWrite : u)(this.typeName, message, writer);
        return writer;
    }
}
/**
 * @generated MessageType for protobuf message ApiError
 */
export const ApiError = new ApiError$Type();
// @generated message type with reflection information, may provide speed optimized methods
class ErrorResponseV1$Type extends MessageType<ErrorResponseV1> {
    constructor() {
        super("ErrorResponseV1", [
            { no: 1, name: "error", kind: "message", oneof: "result", T: () => ApiError },
            { no: 2, name: "status", kind: "scalar", T: 5 /*ScalarType.INT32*/ }
        ]);
    }
    create(value?: PartialMessage<ErrorResponseV1>): ErrorResponseV1 {
        const message = globalThis.Object.create((this.messagePrototype!));
        message.result = { oneofKind: undefined };
        message.status = 0;
        if (value !== undefined)
            reflectionMergePartial<ErrorResponseV1>(this, message, value);
        return message;
    }
    internalBinaryRead(reader: IBinaryReader, length: number, options: BinaryReadOptions, target?: ErrorResponseV1): ErrorResponseV1 {
        let message = target ?? this.create(), end = reader.pos + length;
        while (reader.pos < end) {
            let [fieldNo, wireType] = reader.tag();
            switch (fieldNo) {
                case /* ApiError error */ 1:
                    message.result = {
                        oneofKind: "error",
                        error: ApiError.internalBinaryRead(reader, reader.uint32(), options, (message.result as any).error)
                    };
                    break;
                case /* int32 status */ 2:
                    message.status = reader.int32();
                    break;
                default:
                    let u = options.readUnknownField;
                    if (u === "throw")
                        throw new globalThis.Error(`Unknown field ${fieldNo} (wire type ${wireType}) for ${this.typeName}`);
                    let d = reader.skip(wireType);
                    if (u !== false)
                        (u === true ? UnknownFieldHandler.onRead : u)(this.typeName, message, fieldNo, wireType, d);
            }
        }
        return message;
    }
    internalBinaryWrite(message: ErrorResponseV1, writer: IBinaryWriter, options: BinaryWriteOptions): IBinaryWriter {
        /* ApiError error = 1; */
        if (message.result.oneofKind === "error")
            ApiError.internalBinaryWrite(message.result.error, writer.tag(1, WireType.LengthDelimited).fork(), options).join();
        /* int32 status = 2; */
        if (message.status !== 0)
            writer.tag(2, WireType.Varint).int32(message.status);
        let u = options.writeUnknownFields;
        if (u !== false)
            (u == true ? UnknownFieldHandler.onWrite : u)(this.typeName, message, writer);
        return writer;
    }
}
/**
 * @generated MessageType for protobuf message ErrorResponseV1
 */
export const ErrorResponseV1 = new ErrorResponseV1$Type();
