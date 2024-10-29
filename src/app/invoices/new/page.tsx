"use client";
import { SyntheticEvent, useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { createAction } from "@/app/actions";
import SubmitButton from "@/components/SubmitButton";
import Form from "next/form";
import Container from "@/components/container";
export default function Home() {
  const [state, setState] = useState("ready");

  async function handleOnSubmit(event: SyntheticEvent) {
    if (state === "pending") {
      event.preventDefault();
      return;
    }
    setState("pending");
  }
  return (
    <main className="  h-full ">
      <Container>
        <div className="flex justify-between mb-8">
          <h1 className="text-3xl font-bold">Create a new invoice</h1>
        </div>
        <Form
          action={createAction}
          onSubmit={handleOnSubmit}
          className="grid gap-4 max-w-xs"
        >
          <div>
            <Label
              className="block mb-2 font-semibold text-small"
              htmlFor="name"
            >
              Billing Name
            </Label>
            <Input type="text" name="name" id="name" />
          </div>
          <div>
            <Label
              className="block mb-2 font-semibold text-small"
              htmlFor="email"
            >
              Billing Email
            </Label>
            <Input type="email" name="email" id="email" />
          </div>
          <div>
            <Label
              className="block mb-2 font-semibold text-small"
              htmlFor="value"
            >
              Value
            </Label>
            <Input type="text" name="value" id="value" />
          </div>
          <div>
            <Label
              className="block mb-2 font-semibold text-small"
              htmlFor="description"
            >
              Description
            </Label>
            <Textarea
              name="description"
              id="description"
              cols={30}
              rows={5}
            ></Textarea>
          </div>
          <div>
            <SubmitButton />
          </div>
        </Form>
      </Container>
    </main>
  );
}
