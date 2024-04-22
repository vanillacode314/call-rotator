const GET_NODES_BY_PATH_QUERY = (
	path: string,
	userId: number,
	includeChildren: boolean = false
) => {
	const query = `WITH RECURSIVE
  fs (n, path, id, next_part) AS (
    SELECT
      1,
      __path,
      0,
      __firstpart
    UNION
    SELECT
      n + 1,
      substr (substr (path, 2), instr (substr (path, 2), '/')),
      nodes.id,
      iif (
        instr (
          substr (
            path,
            instr (path, next_part) + length (next_part) + 1
          ),
          '/'
        ) - 1 = -1,
        substr (
          substr (
            path,
            instr (path, next_part) + length (next_part) + 1
          ),
          1
        ),
        substr (
          substr (
            path,
            instr (path, next_part) + length (next_part) + 1
          ),
          1,
          instr (
            substr (
              path,
              instr (path, next_part) + length (next_part) + 1
            ),
            '/'
          ) - 1
        )
      )
    FROM
      fs,
      nodes
    WHERE
      instr (path, '/') != 0
      AND nodes.parent_id = fs.id
      AND next_part = nodes.name
      AND nodes.userid = __userid
  )
SELECT
  *
FROM
  nodes
WHERE
  (
    nodes.id = (
      SELECT
        id
      FROM
        fs
      ORDER BY
        n DESC
      LIMIT
        1
    ) __includeChildren
  )
  AND nodes.userid = __userid`;

	path = path.substring(1);
	const firstPart = path.slice(0, path.indexOf('/') === -1 ? path.length : path.indexOf('/'));
	const lastPart = path.slice(path.lastIndexOf('/') + 1);

	return query
		.replaceAll('__path', `'/${path}'`)
		.replaceAll('__firstpart', `'${firstPart}'`)
		.replaceAll('__lastpart', `'${lastPart}'`)
		.replaceAll('__userid', `${userId}`)
		.replaceAll(
			'__includeChildren',
			includeChildren
				? `OR nodes.parent_id = (
  SELECT
    id
  FROM
    fs
  ORDER BY
    n DESC
  LIMIT
    1
)`
				: ''
		);
};

export { GET_NODES_BY_PATH_QUERY };
