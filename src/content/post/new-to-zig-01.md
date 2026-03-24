---
title: "-- 初识zig--zig中的error处理"
description: "zig中的error处理。"
publishDate: "2026-03-24"
tags: ["coding","zig"]
draft: false
pinned: false
# updatedDate: "2026-03-24"
# ogImage: "/social-image.png"
# coverImage:
#   src: "./cover.png"
#   alt: "Describe the cover image"
---
根据zig语言的官方描述，zig是一种心智负担较低的语言，且有zig自己的强大的编译器支持，所以最近接触了下zig这门语言，除了基本的语法外
此处记录下zig和其他语言不一样的地方，**zig中的error处理**。

在zig中，可以通过`error{}`来定义一个错误类型，并且可以通过`return error.SomeError{}`来返回一个错误。
```zig
const std = @import("std");
const NumberError = error{
    "TypeError",
    "TooBig",
    "TooSmall"
};

pub fn main() !void {
    const err = foo(NumberError.TooBig);
    if (err == NumberError.TooBig) {
        std.debug.warn("Too big!\n", .{});
    };
}

fn foo(err: NumberError) NumberError {
    return err;
}
```
对于错误处理，可以通过`catch`来处理错误或者返回默认值

```zig
fn doAThing(str: []u8) void {
    const number = parseU64(str, 10) catch 13;
    _ = number; // ...
}
```
number 必定是一个类型为 u64 的值。当发生错误时，number 将被赋予默认值 13。

而`try`可以返回错误值
```zig
fn doAThing1(str: []u8) !void {
    const number = try parseU64(str, 10);
    _ = number;
}

fn doAThing1(str: []u8) !void {
    const number = parseU64(str, 10) catch |err| return err;
    _ = number;
}
```
:::tip
`try`可以用`catch`替代，但是`try`更加简洁
:::

如果不想要处理错误，可以使用`_`来忽略错误
```zig
fn doADifferentThing(str: []u8) void {
    if (parseU64(str, 10)) |number| {
        doSomethingWithNumber(number);
    } else |_| {
        // 你也可以在这里做点额外的事情
    }
    // 或者你也可以这样：
    parseU64(str, 10) catch {};
}
```


