<?php
// backend/lib/redis_client.php
// 최소 RESP 프로토콜 클라이언트 — GET/SET(EX)/DEL만 지원한다.
// Composer/phpredis 확장 없이도 도네, RottenNoble-HttpServer(Node)·
// RottenNoble-TCPServer(C++/hiredis)와 완전히 같은 Redis 인스턴스·같은
// 명령(SET key value EX seconds / GET / DEL)을 그대로 쓴다.

class RedisClient
{
    private $socket;

    public function __construct(string $host, int $port, float $timeout = 2.0)
    {
        $this->socket = @fsockopen($host, $port, $errno, $errstr, $timeout);
        if (!$this->socket) {
            throw new RuntimeException("Redis 연결 실패: $errstr ($errno)");
        }
    }

    private function command(array $args)
    {
        $cmd = '*' . count($args) . "\r\n";
        foreach ($args as $arg) {
            $cmd .= '$' . strlen($arg) . "\r\n" . $arg . "\r\n";
        }
        fwrite($this->socket, $cmd);
        return $this->readReply();
    }

    private function readReply()
    {
        $line = fgets($this->socket);
        if ($line === false) {
            throw new RuntimeException('Redis 응답 없음');
        }
        $type = $line[0];
        $payload = rtrim(substr($line, 1), "\r\n");

        switch ($type) {
            case '+':
                return $payload;
            case '-':
                throw new RuntimeException("Redis error: $payload");
            case ':':
                return (int)$payload;
            case '$':
                $len = (int)$payload;
                if ($len === -1) {
                    return null;
                }
                $data = '';
                while (strlen($data) < $len) {
                    $data .= fread($this->socket, $len - strlen($data));
                }
                fread($this->socket, 2); // trailing \r\n
                return $data;
            default:
                throw new RuntimeException("지원하지 않는 응답 타입: $type");
        }
    }

    public function set(string $key, string $value, int $exSeconds): bool
    {
        return $this->command(['SET', $key, $value, 'EX', (string)$exSeconds]) === 'OK';
    }

    public function get(string $key): ?string
    {
        return $this->command(['GET', $key]);
    }

    public function del(string $key): int
    {
        return $this->command(['DEL', $key]);
    }

    public function close(): void
    {
        if ($this->socket) {
            fclose($this->socket);
        }
    }
}
