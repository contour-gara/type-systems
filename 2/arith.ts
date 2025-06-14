import { parseArith } from "npm:tiny-ts-parser";
import { assertEquals, assertThrows } from "jsr:@std/assert";

type Type = { tag: "Boolean" } | { tag: "Number" };

type Term =
    | { tag: "true" }
    | { tag: "false" }
    | { tag: "if"; cond: Term; thn: Term; els: Term }
    | { tag: "number"; n: number }
    | { tag: "add"; left: Term; right: Term };

function typecheck(t: Term): Type {
    switch (t.tag) {
        case "true":
            return { tag: "Boolean" };
        case "false":
            return { tag: "Boolean" };
        case "if": {
            const condTy = typecheck(t.cond);
            if (condTy.tag !== "Boolean") throw new Error("boolean expected");
            const thnTy = typecheck(t.thn);
            const elsTy = typecheck(t.els);
            if (thnTy.tag !== elsTy.tag) {
                throw new Error("then and else have different types");
            }
            return thnTy;
        }
        case "number":
            return { tag: "Number" };
        case "add": {
            const leftTy = typecheck(t.left);
            if (leftTy.tag !== "Number") throw new Error("number expected");
            const rightTy = typecheck(t.right);
            if (rightTy.tag !== "Number") throw new Error("number expected");
            return { tag: "Number" };
        }
    }
}

console.log(typecheck(parseArith("true ? 1 : 2")));

Deno.test("Number 同士の足し算の場合、Number が返る", () => {
    const actual = typecheck(parseArith("1 + 2"));
    assertEquals(actual, { tag: "Number" });
});

Deno.test("条件式で返す型が Boolean の場合、Boolean が返る", () => {
    const actual = typecheck(parseArith("true ? true : false"));
    assertEquals(actual, { tag: "Boolean" });
});

Deno.test("条件式で返す型が Number の場合、Number が返る", () => {
    const actual = typecheck(parseArith("true ? 1 : 1 + 2"));
    assertEquals(actual, { tag: "Number" });
});

Deno.test("足し算の左項が Boolean の場合、例外が返る", () => {
    assertThrows(
        () => typecheck(parseArith("true + 2")),
        Error,
        "number expected"
    );
});

Deno.test("足し算の右項が Boolean の場合、例外が返る", () => {
    assertThrows(
        () => typecheck(parseArith("2 + false")),
        Error,
        "number expected"
    );
});

Deno.test("条件式の条件が Number の場合、例外が返る", () => {
    assertThrows(
        () => typecheck(parseArith("1 + 2 ? 1 : 2")),
        Error,
        "boolean expected"
    );
});

Deno.test("条件式の返り値の型が異なる場合、例外が返る", () => {
    assertThrows(
        () => typecheck(parseArith("true ? 1 : false")),
        Error,
        "then and else have different types"
    );
});
