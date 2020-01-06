/* eslint-disable no-bitwise */
import React, {
  useState, useLayoutEffect, useCallback,
} from "react"
import { SketchPicker, ColorChangeHandler } from "react-color"
import {
  Button, Modal, Form, InputNumber, message,
} from "antd"
import randomColor from "randomcolor"

import Styles from "./index.module.scss"

class Color {
  r = 0

  g = 0

  b = 0

  a = 0

  constructor(r = 0, g?: number, b?: number, a?: number) {
    this.set(r, g, b, a)
  }

  set(r: number, g?: number, b?: number, a?: number) {
    if (g !== undefined && b !== undefined && a !== undefined) {
      this.r = r
      this.g = g
      this.b = b
      this.a = a
    } else {
      this.r = (r >> 16) % 256
      this.g = (r >> 8) % 256
      this.b = r % 256
      this.a = 255
    }
  }

  get value() {
    return (this.r << 16) + (this.g << 8) + this.b
  }
}

const canvas = document.querySelector("#canvas") as HTMLCanvasElement
const ctx = canvas.getContext("2d") as CanvasRenderingContext2D

function randomColors(): [Color, Color, Color, Color] {
  return [
    new Color(...randomColor({ format: "rgbArray" }), 255),
    new Color(...randomColor({ format: "rgbArray" }), 255),
    new Color(...randomColor({ format: "rgbArray" }), 255),
    new Color(...randomColor({ format: "rgbArray" }), 255),
  ]
}

const defColors: [Color, Color, Color, Color] = randomColors()

function updateCanvasSize() {
  const { clientWidth, clientHeight } = canvas
  canvas.width = clientWidth
  canvas.height = clientHeight
}

function updateCanvasColor(_canvas: HTMLCanvasElement, c0: Color, c1: Color, c2: Color, c3: Color) {
  const { width, height } = _canvas
  const imageData = ctx.getImageData(0, 0, width, height)
  const { data } = imageData

  function setDataColor(x: number, y: number, color: Color) {
    const n = (x + y * width) * 4

    data[n] = color.r
    data[n + 1] = color.g
    data[n + 2] = color.b
    data[n + 3] = color.a
  }

  function calcColor(x: number, startX: number, endX: number, startColor: number, endColor: number) {
    return startColor + (endColor - startColor) * ((x - startX) / (endX - startX))
  }

  const color = new Color()
  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      const r = calcColor(y, 0, height, calcColor(x, 0, width, c0.r, c1.r), calcColor(x, 0, width, c2.r, c3.r))
      const g = calcColor(y, 0, height, calcColor(x, 0, width, c0.g, c1.g), calcColor(x, 0, width, c2.g, c3.g))
      const b = calcColor(y, 0, height, calcColor(x, 0, width, c0.b, c1.b), calcColor(x, 0, width, c2.b, c3.b))
      const a = 255
      color.set(r, g, b, a)
      setDataColor(x, y, color)
    }
  }

  ctx.putImageData(imageData, 0, 0)
}

type ImageType = "image/jpeg" | "image/png"

interface ColorSelectorBtnProps {
  color: Color;
  corner: 0 | 1 | 2 | 3;
  onChangeComplete?: ColorChangeHandler;
}

function ColorSelectorBtn({ color, corner, onChangeComplete }: ColorSelectorBtnProps) {
  const [selectorVisible, setSelectorVisible] = useState(false)
  let cornerClassName: string
  let diagCornerClassName: string
  switch (corner) {
  case 0:
    cornerClassName = Styles.btnCorner0
    diagCornerClassName = Styles.btnCorner3
    break
  case 1:
    cornerClassName = Styles.btnCorner1
    diagCornerClassName = Styles.btnCorner2
    break
  case 2:
    cornerClassName = Styles.btnCorner2
    diagCornerClassName = Styles.btnCorner1
    break
  default:
    cornerClassName = Styles.btnCorner3
    diagCornerClassName = Styles.btnCorner0
    break
  }
  return <>
    {
      !selectorVisible && <Button
        className={cornerClassName}
        icon="bg-colors"
        shape="circle"
        onClick={() => {
          setSelectorVisible(true)
        }}
      />
    }
    {
      selectorVisible && <>
        <div className={Styles.layer} style={{
          zIndex: 9,
        }} onClick={() => {
          setSelectorVisible(false)
        }}></div>
        <div className={diagCornerClassName} style={{
          zIndex: 10,
        }}>
          <SketchPicker color={color} onChangeComplete={onChangeComplete} />
        </div>
      </>
    }
  </>
}

export default function App() {
  const [colors, setColors] = useState(defColors)
  const [autoSize, setAutoSize] = useState(true)
  const [width, setWidth] = useState(canvas.width)
  const [height, setHeight] = useState(canvas.height)
  const [modalVisible, setModalVisible] = useState(false)
  const [dataUrl, setDataUrl] = useState("")
  const [confirmLoading, setConfirmLoading] = useState(false)

  const updateCanvas = useCallback(() => {
    updateCanvasSize()
    if (autoSize) {
      setWidth(canvas.width)
      setHeight(canvas.height)
    }
    updateCanvasColor(canvas, ...colors)
  }, [colors, autoSize])

  useLayoutEffect(() => {
    updateCanvas()
    window.addEventListener("resize", updateCanvas)
    return () => {
      window.removeEventListener("resize", updateCanvas)
    }
  }, [updateCanvas])

  const createImageUrl = useCallback(() => {
    canvas.width = width
    canvas.height = height
    updateCanvasColor(canvas, ...colors)
    setDataUrl(canvas.toDataURL("image/jpeg"))
    updateCanvas()
  }, [width, height, colors, updateCanvas])

  return <>
    <ColorSelectorBtn color={colors[0]} corner={0} onChangeComplete={({
      rgb: {
        r, g, b, a,
      },
    }) => {
      const newColors = [...colors] as [Color, Color, Color, Color]
      newColors[0].set(r, g, b, a)
      setColors(newColors)
    }} />
    <ColorSelectorBtn color={colors[1]} corner={1} onChangeComplete={({
      rgb: {
        r, g, b, a,
      },
    }) => {
      const newColors = [...colors] as [Color, Color, Color, Color]
      newColors[1].set(r, g, b, a)
      setColors(newColors)
    }} />
    <ColorSelectorBtn color={colors[2]} corner={2} onChangeComplete={({
      rgb: {
        r, g, b, a,
      },
    }) => {
      const newColors = [...colors] as [Color, Color, Color, Color]
      newColors[2].set(r, g, b, a)
      setColors(newColors)
    }} />
    <ColorSelectorBtn color={colors[3]} corner={3} onChangeComplete={({
      rgb: {
        r, g, b, a,
      },
    }) => {
      const newColors = [...colors] as [Color, Color, Color, Color]
      newColors[3].set(r, g, b, a)
      setColors(newColors)
    }} />

    <Button
      className={Styles.download}
      icon="download"
      onClick={() => {
        setModalVisible(!modalVisible)
      }}
    />

    <Button
      className={Styles.reload}
      icon="reload"
      onClick={() => {
        setColors(randomColors())
      }}
    />

    <Modal
      title="生成图片"
      okText="立即生成图片"
      cancelText="取消"
      visible={modalVisible}
      confirmLoading={confirmLoading}
      maskClosable={true}
      onCancel={() => {
        setDataUrl("")
        setModalVisible(false)
      }}
      onOk={() => {
        // 这儿是出于心理学考虑
        // 先清除url, 0.5秒后再构建, 人们才能相信你确实是重新生成了图片
        // 要不然没一点反应, 人们总是以为按钮没点到...
        setDataUrl("")
        setConfirmLoading(true)
        setTimeout(() => {
          createImageUrl()
          setConfirmLoading(false)
        }, 500)
      }}
    >
      <Form layout="inline">
        <Form.Item>
          <InputNumber
            value={width}
            precision={0}
            min={1}
            formatter={(val) => `宽: ${val}`}
            parser={(val = "") => val.replace(/\D/g, "")}
            onChange={(val = 1) => {
              const targetVal = val > 0 ? val : 1
              setAutoSize(false)
              setWidth(targetVal)
            }}
          />
        </Form.Item>
        <Form.Item>
          <InputNumber
            value={height}
            precision={0}
            min={1}
            formatter={(val) => `高: ${val}`}
            parser={(val = "") => val.replace(/\D/g, "")}
            onChange={(val = 1) => {
              const targetVal = val > 0 ? val : 1
              setAutoSize(false)
              setHeight(targetVal)
            }}
          />
        </Form.Item>
        <Form.Item>
          <Button icon="reload" onClick={() => {
            setAutoSize(true)
            setWidth(canvas.width)
            setHeight(canvas.height)
            setDataUrl("")
          }}>尺寸跟随窗口</Button>
        </Form.Item>
        <Form.Item>
          <Button icon="reload" onClick={() => {
            if (window.screen && window.screen.width && window.screen.height) {
              setAutoSize(false)
              setWidth(window.screen.width)
              setHeight(window.screen.height)
              setDataUrl("")
            } else {
              message.error("无法获取屏幕尺寸")
            }
          }}>尺寸跟随屏幕</Button>
        </Form.Item>
        <Form.Item>
          {
            dataUrl && <Button type="link" icon="download" href={dataUrl} download="壁纸">点此保存图片</Button>
          }
        </Form.Item>
      </Form>
    </Modal>
  </>
}
