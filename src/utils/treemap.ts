export interface TreemapItem<T = any> {
  id: string;
  value: number; // weight / area
  data: T;
}

export interface TreemapRect<T = any> {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  data: T;
}

/**
 * Squarified Treemap Layout Algorithm
 * Bruls, Huizing, van Wijk (2000)
 * Computes optimal aspect ratios for rectangles filling a container.
 */
export function computeSquarifiedTreemap<T = any>(
  items: TreemapItem<T>[],
  containerWidth: number,
  containerHeight: number,
  padding: number = 2
): TreemapRect<T>[] {
  if (!items.length || containerWidth <= 0 || containerHeight <= 0) {
    return [];
  }

  // Filter out invalid items and sort descending by value
  const validItems = items
    .filter(i => i.value > 0)
    .sort((a, b) => b.value - a.value);

  if (!validItems.length) return [];

  const totalValue = validItems.reduce((acc, cur) => acc + cur.value, 0);
  if (totalValue <= 0) return [];

  const totalArea = containerWidth * containerHeight;

  // Normalized area for each item
  const normalizedItems = validItems.map(item => ({
    ...item,
    area: (item.value / totalValue) * totalArea,
  }));

  const results: TreemapRect<T>[] = [];

  let currentRect = {
    x: 0,
    y: 0,
    width: containerWidth,
    height: containerHeight,
  };

  let row: typeof normalizedItems = [];

  function worst(rowItems: typeof normalizedItems, sideLength: number): number {
    if (!rowItems.length || sideLength <= 0) return Infinity;
    const rowArea = rowItems.reduce((s, it) => s + it.area, 0);
    const side2 = sideLength * sideLength;
    const area2 = rowArea * rowArea;

    let maxW = 0;
    for (const it of rowItems) {
      const val = it.area;
      const w = Math.max((side2 * val) / area2, area2 / (side2 * val));
      if (w > maxW) maxW = w;
    }
    return maxW;
  }

  function layoutRow(
    rowItems: typeof normalizedItems,
    container: { x: number; y: number; width: number; height: number }
  ) {
    const isHorizontal = container.width >= container.height;
    const rowArea = rowItems.reduce((s, it) => s + it.area, 0);

    if (isHorizontal) {
      // Row along height, advances along width
      const rowWidth = rowArea / container.height;
      let currentY = container.y;

      for (const it of rowItems) {
        const itemHeight = it.area / rowWidth;
        results.push({
          id: it.id,
          x: container.x + padding,
          y: currentY + padding,
          width: Math.max(0, rowWidth - padding * 2),
          height: Math.max(0, itemHeight - padding * 2),
          data: it.data,
        });
        currentY += itemHeight;
      }

      container.x += rowWidth;
      container.width -= rowWidth;
    } else {
      // Row along width, advances along height
      const rowHeight = rowArea / container.width;
      let currentX = container.x;

      for (const it of rowItems) {
        const itemWidth = it.area / rowHeight;
        results.push({
          id: it.id,
          x: currentX + padding,
          y: container.y + padding,
          width: Math.max(0, itemWidth - padding * 2),
          height: Math.max(0, rowHeight - padding * 2),
          data: it.data,
        });
        currentX += itemWidth;
      }

      container.y += rowHeight;
      container.height -= rowHeight;
    }
  }

  for (let i = 0; i < normalizedItems.length; i++) {
    const it = normalizedItems[i];
    const shorterSide = Math.min(currentRect.width, currentRect.height);

    if (row.length === 0) {
      row.push(it);
    } else {
      const currentWorst = worst(row, shorterSide);
      const nextWorst = worst([...row, it], shorterSide);

      if (nextWorst <= currentWorst) {
        row.push(it);
      } else {
        layoutRow(row, currentRect);
        row = [it];
      }
    }
  }

  if (row.length > 0) {
    layoutRow(row, currentRect);
  }

  return results;
}
