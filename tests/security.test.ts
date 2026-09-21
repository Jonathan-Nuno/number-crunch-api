import assert from "node:assert/strict";
import { after, before, test } from "node:test";
import type { AddressInfo } from "node:net";
import type { Server } from "node:http";
import app from "../src/app";

let server: Server;
let baseUrl: string;

before(async () => {
  await new Promise<void>((resolve) => {
    server = app.listen(0, "127.0.0.1", () => {
      const address = server.address() as AddressInfo;
      baseUrl = `http://127.0.0.1:${address.port}`;
      resolve();
    });
  });
});

after(async () => {
  await new Promise<void>((resolve, reject) => {
    server.close((error) => (error ? reject(error) : resolve()));
  });
});

test("calculates a bounded repayment schedule", async () => {
  const response = await fetch(`${baseUrl}/api/calculate`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      balance: 1_000,
      interestRate: 12,
      minimumPayment: 100,
      flatMinimumPayment: true,
      extraPayment: 25,
    }),
  });

  assert.equal(response.status, 200);
  const body = (await response.json()) as {
    paymentInformation: { totalPaidPrincipal: number };
    paymentSchedule: unknown[];
  };
  assert.ok(body.paymentSchedule.length > 0);
  assert.ok(body.paymentSchedule.length < 1_200);
  assert.ok(Math.abs(body.paymentInformation.totalPaidPrincipal - 1_000) < 0.01);
});

test("rejects a payment that cannot cover monthly interest", async () => {
  const response = await fetch(`${baseUrl}/api/calculate`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      balance: 10_000,
      interestRate: 100,
      minimumPayment: 1,
      flatMinimumPayment: true,
      extraPayment: 0,
    }),
  });

  assert.equal(response.status, 422);
});

test("rejects non-object JSON bodies", async () => {
  const response = await fetch(`${baseUrl}/api/calculate`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: "[]",
  });

  assert.equal(response.status, 400);
});

test("rejects unsupported browser origins", async () => {
  const response = await fetch(`${baseUrl}/api/calculate`, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      origin: "https://attacker.example",
    },
    body: "{}",
  });

  assert.equal(response.status, 403);
});

test("rejects oversized JSON bodies", async () => {
  const response = await fetch(`${baseUrl}/api/calculate`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ padding: "x".repeat(11_000) }),
  });

  assert.equal(response.status, 413);
});
