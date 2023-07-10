import React from 'react';

const SkeletonTable = (rowCount, columnCount) => {
  const rows = [];
  
  for (let i = 0; i < rowCount; i++) {
    const cells = [];

    for (let j = 0; j < columnCount; j++) {
      cells.push(
        <td class="td">
            <div class="loader"></div>
        </td>
      );
    }

    rows.push(
      <tr class="tr">
        {cells}
      </tr>
    );
  }

  return rows;
};

export default SkeletonTable;

