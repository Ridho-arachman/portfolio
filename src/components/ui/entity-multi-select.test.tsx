// Unit test EntityMultiSelect: kontrak yang dipakai kelima admin form —
// toggle add/remove, state terpilih terbaca lewat aria-pressed (bukan hanya
// warna), dan tautan yang tidak ada di `options` tetap bisa dilepas.
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useState } from "react";
import { describe, expect, it, vi } from "vitest";

import { EntityMultiSelect } from "./entity-multi-select";

const options = [
  { id: "c1", label: "AWS Certified" },
  { id: "c2", label: "Kubernetes Admin" },
];

function Harness({
  initial = [] as string[],
  ...props
}: Partial<React.ComponentProps<typeof EntityMultiSelect>> & {
  initial?: string[];
}) {
  const [value, setValue] = useState(initial);
  return (
    <EntityMultiSelect
      label="Certificates"
      options={options}
      value={value}
      onChange={setValue}
      {...props}
    />
  );
}

describe("EntityMultiSelect", () => {
  it("exposes every option as a toggle button reflecting its state", () => {
    render(<Harness initial={["c1"]} />);

    expect(screen.getByRole("button", { name: "AWS Certified" })).toHaveAttribute(
      "aria-pressed",
      "true",
    );
    expect(
      screen.getByRole("button", { name: "Kubernetes Admin" }),
    ).toHaveAttribute("aria-pressed", "false");
  });

  it("selects and deselects through a keyboard-reachable button", async () => {
    const user = userEvent.setup();
    render(<Harness />);

    screen.getByRole("button", { name: "AWS Certified" }).focus();

    await user.keyboard("{Enter}");
    expect(
      screen.getByRole("button", { name: "AWS Certified" }),
    ).toHaveAttribute("aria-pressed", "true");
    expect(
      screen.getByRole("button", { name: "Remove AWS Certified" }),
    ).toBeInTheDocument();

    await user.keyboard("{Enter}");
    expect(
      screen.getByRole("button", { name: "AWS Certified" }),
    ).toHaveAttribute("aria-pressed", "false");
  });

  it("filters the option list without dropping the current selection", async () => {
    const user = userEvent.setup();
    render(<Harness initial={["c2"]} />);

    await user.type(screen.getByLabelText("Search..."), "aws");

    expect(
      screen.getByRole("button", { name: "AWS Certified" }),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: "Kubernetes Admin" }),
    ).not.toBeInTheDocument();
    // Selection tersembunyi dari filter tetap terlihat sebagai chip.
    expect(
      screen.getByRole("button", { name: "Remove Kubernetes Admin" }),
    ).toBeInTheDocument();
  });

  // `set` pada relasi m-n mengganti SELURUH tautan, jadi id yang tertaut tapi
  // tidak ada di `options` (mis. baris yang sudah di-trash) harus bisa dilepas,
  // kalau tidak tautan itu hilang diam-diam setiap kali form disimpan.
  it("keeps a selected id that has no matching option removable", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(
      <EntityMultiSelect
        label="Certificates"
        options={[]}
        value={["trashed-1"]}
        onChange={onChange}
      />,
    );

    await user.click(screen.getByRole("button", { name: /remove trashed-1/i }));

    expect(onChange).toHaveBeenCalledWith([]);
  });

  it("clears every selection at once", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(
      <EntityMultiSelect
        label="Certificates"
        options={options}
        value={["c1", "c2"]}
        onChange={onChange}
      />,
    );

    await user.click(screen.getByRole("button", { name: /clear all/i }));

    expect(onChange).toHaveBeenCalledWith([]);
  });

  it("labels the group so the field is announced with its label", () => {
    render(<Harness />);

    expect(screen.getByRole("group", { name: "Certificates" })).toBeInTheDocument();
  });
});