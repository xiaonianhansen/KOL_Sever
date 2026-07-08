import React, { useState, useEffect, useRef } from 'react';
import { Card, Row, Col, Statistic, Table, Tag, Spin } from 'antd';
import * as echarts from 'echarts';
import { worldMapData } from '../assets/worldMapData';
import { kolAPI } from '../api';
import { useTheme } from '../index';

// 国家名称映射（中文到英文）
const countryNameMap = {
  '美国': 'United States',
  '日本': 'Japan',
  '法国': 'France',
  '德国': 'Germany',
  '英国': 'United Kingdom',
  '韩国': 'South Korea',
  '泰国': 'Thailand',
  '巴西': 'Brazil',
  '印度': 'India',
  '中国': 'China',
  '加拿大': 'Canada',
  '澳大利亚': 'Australia',
  '墨西哥': 'Mexico',
  '俄罗斯': 'Russia',
  '意大利': 'Italy',
  '西班牙': 'Spain',
  '印度尼西亚': 'Indonesia',
  '土耳其': 'Turkey',
  '沙特阿拉伯': 'Saudi Arabia',
  '埃及': 'Egypt',
  '尼日利亚': 'Nigeria',
  '南非': 'South Africa',
  '阿根廷': 'Argentina',
  '越南': 'Vietnam',
  '菲律宾': 'Philippines',
  '马来西亚': 'Malaysia',
  '波兰': 'Poland',
  '乌克兰': 'Ukraine',
  '哥伦比亚': 'Colombia',
  '秘鲁': 'Peru',
  '智利': 'Chile',
  '新西兰': 'New Zealand',
  '巴基斯坦': 'Pakistan',
  '孟加拉国': 'Bangladesh',
  '伊拉克': 'Iraq',
  '伊朗': 'Iran',
  '摩洛哥': 'Morocco',
  '肯尼亚': 'Kenya',
  '埃塞俄比亚': 'Ethiopia',
  '希腊': 'Greece',
  '葡萄牙': 'Portugal',
  '瑞典': 'Sweden',
  '挪威': 'Norway',
  '芬兰': 'Finland',
  '丹麦': 'Denmark',
  '荷兰': 'Netherlands',
  '比利时': 'Belgium',
  '瑞士': 'Switzerland',
  '奥地利': 'Austria',
  '捷克': 'Czech Republic',
  '匈牙利': 'Hungary',
  '罗马尼亚': 'Romania',
  '以色列': 'Israel',
  '阿联酋': 'United Arab Emirates',
  '卡塔尔': 'Qatar',
  '新加坡': 'Singapore',
  '古巴': 'Cuba',
  '委内瑞拉': 'Venezuela',
  '厄瓜多尔': 'Ecuador',
  '玻利维亚': 'Bolivia',
  '巴拉圭': 'Paraguay',
  '乌拉圭': 'Uruguay',
  '哥斯达黎加': 'Costa Rica',
  '巴拿马': 'Panama',
  '危地马拉': 'Guatemala',
  '洪都拉斯': 'Honduras',
  '尼加拉瓜': 'Nicaragua',
  '萨尔瓦多': 'El Salvador',
  '多米尼加': 'Dominican Republic',
  '牙买加': 'Jamaica',
  '特立尼达和多巴哥': 'Trinidad and Tobago',
  '圭亚那': 'Guyana',
  '苏里南': 'Suriname',
  '法属圭亚那': 'French Guiana',
  '阿尔及利亚': 'Algeria',
  '利比亚': 'Libya',
  '突尼斯': 'Tunisia',
  '苏丹': 'Sudan',
  '坦桑尼亚': 'Tanzania',
  '乌干达': 'Uganda',
  '卢旺达': 'Rwanda',
  '布隆迪': 'Burundi',
  '刚果民主共和国': 'Democratic Republic of the Congo',
  '刚果': 'Republic of the Congo',
  '加蓬': 'Gabon',
  '喀麦隆': 'Cameroon',
  '中非共和国': 'Central African Republic',
  '乍得': 'Chad',
  '尼日尔': 'Niger',
  '马里': 'Mali',
  '布基纳法索': 'Burkina Faso',
  '加纳': 'Ghana',
  '科特迪瓦': 'Ivory Coast',
  '几内亚': 'Guinea',
  '塞内加尔': 'Senegal',
  '毛里塔尼亚': 'Mauritania',
  '安哥拉': 'Angola',
  '赞比亚': 'Zambia',
  '津巴布韦': 'Zimbabwe',
  '莫桑比克': 'Mozambique',
  '马达加斯加': 'Madagascar',
  '马拉维': 'Malawi',
  '博茨瓦纳': 'Botswana',
  '纳米比亚': 'Namibia',
  '莱索托': 'Lesotho',
  '斯威士兰': 'Eswatini',
  '索马里': 'Somalia',
  '吉布提': 'Djibouti',
  '厄立特里亚': 'Eritrea',
  '南苏丹': 'South Sudan',
  '多哥': 'Togo',
  '贝宁': 'Benin',
  '塞拉利昂': 'Sierra Leone',
  '利比里亚': 'Liberia',
  '冈比亚': 'Gambia',
  '几内亚比绍': 'Guinea-Bissau',
  '佛得角': 'Cape Verde',
  '圣多美和普林西比': 'Sao Tome and Principe',
  '赤道几内亚': 'Equatorial Guinea',
  '科摩罗': 'Comoros',
  '毛里求斯': 'Mauritius',
  '塞舌尔': 'Seychelles',
  '缅甸': 'Myanmar',
  '老挝': 'Laos',
  '柬埔寨': 'Cambodia',
  '文莱': 'Brunei',
  '东帝汶': 'Timor-Leste',
  '巴布亚新几内亚': 'Papua New Guinea',
  '斐济': 'Fiji',
  '所罗门群岛': 'Solomon Islands',
  '瓦努阿图': 'Vanuatu',
  '萨摩亚': 'Samoa',
  '汤加': 'Tonga',
  '蒙古': 'Mongolia',
  '哈萨克斯坦': 'Kazakhstan',
  '乌兹别克斯坦': 'Uzbekistan',
  '土库曼斯坦': 'Turkmenistan',
  '吉尔吉斯斯坦': 'Kyrgyzstan',
  '塔吉克斯坦': 'Tajikistan',
  '阿富汗': 'Afghanistan',
  '尼泊尔': 'Nepal',
  '不丹': 'Bhutan',
  '斯里兰卡': 'Sri Lanka',
  '马尔代夫': 'Maldives',
  '阿曼': 'Oman',
  '也门': 'Yemen',
  '约旦': 'Jordan',
  '叙利亚': 'Syria',
  '黎巴嫩': 'Lebanon',
  '巴勒斯坦': 'Palestine',
  '科威特': 'Kuwait',
  '巴林': 'Bahrain',
  '格鲁吉亚': 'Georgia',
  '亚美尼亚': 'Armenia',
  '阿塞拜疆': 'Azerbaijan',
  '塞浦路斯': 'Cyprus',
  '摩尔多瓦': 'Moldova',
  '白俄罗斯': 'Belarus',
  '立陶宛': 'Lithuania',
  '拉脱维亚': 'Latvia',
  '爱沙尼亚': 'Estonia',
  '爱尔兰': 'Ireland',
  '冰岛': 'Iceland',
  '格陵兰': 'Greenland',
  '阿拉斯加': 'Alaska',
  '夏威夷': 'Hawaii',
  '朝鲜': 'North Korea',
  '台湾': 'Taiwan',
  '香港': 'Hong Kong',
  '澳门': 'Macau',
  '卢森堡': 'Luxembourg',
  '斯洛文尼亚': 'Slovenia',
  '克罗地亚': 'Croatia',
  '波黑': 'Bosnia and Herzegovina',
  '塞尔维亚': 'Serbia',
  '黑山': 'Montenegro',
  '阿尔巴尼亚': 'Albania',
  '北马其顿': 'North Macedonia',
  '保加利亚': 'Bulgaria',
  '斯洛伐克': 'Slovakia',
  '马耳他': 'Malta',
  '安道尔': 'Andorra',
  '摩纳哥': 'Monaco',
  '圣马力诺': 'San Marino',
  '梵蒂冈': 'Vatican',
  '列支敦士登': 'Liechtenstein'
};

// 英文到中文的反向映射
const englishToChineseMap = Object.fromEntries(
  Object.entries(countryNameMap).map(([cn, en]) => [en, cn])
);

function Stats() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(false);
  const { isDarkMode } = useTheme();
  const barChartRef = useRef(null);
  const pieChartRef = useRef(null);
  const mapChartRef = useRef(null);
  const barInstanceRef = useRef(null);
  const pieInstanceRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const [mapLoaded, setMapLoaded] = useState(false);

  useEffect(() => {
    fetchStats();
    loadMapData();
    return () => {
      if (barInstanceRef.current) barInstanceRef.current.dispose();
      if (pieInstanceRef.current) pieInstanceRef.current.dispose();
      if (mapInstanceRef.current) mapInstanceRef.current.dispose();
    };
  }, []);

  useEffect(() => {
    if (stats && mapLoaded) {
      renderCharts();
    }
  }, [stats, isDarkMode, mapLoaded]);

  const loadMapData = async () => {
    try {
      // 直接使用本地地图数据，避免外部 CDN 访问失败
      console.log('加载本地地图数据');
      echarts.registerMap('world', worldMapData);
      setMapLoaded(true);
    } catch (error) {
      console.error('加载地图数据失败:', error);
      setMapLoaded(true); // 即使失败也设置为已加载，避免阻塞其他功能
    }
  };

  const fetchStats = async () => {
    setLoading(true);
    try {
      const response = await kolAPI.getStats();
      setStats(response.data.data);
    } catch (error) {
      console.error('获取统计数据失败');
    } finally {
      setLoading(false);
    }
  };

  const renderCharts = () => {
    if (!barChartRef.current || !pieChartRef.current || !mapChartRef.current) return;

    if (!barInstanceRef.current) {
      barInstanceRef.current = echarts.init(barChartRef.current);
    }
    if (!pieInstanceRef.current) {
      pieInstanceRef.current = echarts.init(pieChartRef.current);
    }
    if (!mapInstanceRef.current) {
      mapInstanceRef.current = echarts.init(mapChartRef.current);
    }

    barInstanceRef.current.setOption(getBarOption(), true);
    pieInstanceRef.current.setOption(getPieOption(), true);
    mapInstanceRef.current.setOption(getMapOption(), true);
  };

  const formatFollowers = (num) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(2)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  const getBarOption = () => {
    const textColor = isDarkMode ? '#ffffff' : '#000000';
    const bgColor = isDarkMode ? '#121212' : '#ffffff';
    const axisLineColor = isDarkMode ? '#2f2f2f' : '#d9d9d9';
    const splitLineColor = isDarkMode ? '#2f2f2f' : '#f0f0f0';
    const barColor1 = isDarkMode ? '#25F4EE' : '#1677ff';
    const barColor2 = isDarkMode ? '#FE2C55' : '#4096ff';

    const hasData = stats && stats.platformDistribution && stats.platformDistribution.length > 0;
    const xData = hasData ? stats.platformDistribution.map(item => item.platform) : ['暂无'];
    const seriesData = hasData ? stats.platformDistribution.map(item => item.count) : [0];

    return {
      title: { text: '平台达人数量', left: 'center', textStyle: { color: textColor, fontSize: 16, fontWeight: 600 } },
      tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' } },
      grid: { left: '3%', right: '4%', bottom: '3%', containLabel: true },
      xAxis: { type: 'category', data: xData, axisLabel: { color: textColor, interval: 0, rotate: 30 }, axisLine: { lineStyle: { color: axisLineColor } } },
      yAxis: { type: 'value', axisLabel: { color: textColor }, axisLine: { lineStyle: { color: axisLineColor } }, splitLine: { lineStyle: { color: splitLineColor } } },
      series: [{
        name: '达人数量',
        type: 'bar',
        data: seriesData,
        itemStyle: {
          color: hasData ? { type: 'linear', x: 0, y: 0, x2: 0, y2: 1, colorStops: [{ offset: 0, color: barColor1 }, { offset: 1, color: barColor2 }] } : '#d9d9d9',
          borderRadius: [8, 8, 0, 0]
        },
        barWidth: '60%',
        label: { show: true, position: 'top', color: textColor, fontSize: 12 }
      }],
      backgroundColor: bgColor
    };
  };

  const getPieOption = () => {
    const textColor = isDarkMode ? '#ffffff' : '#000000';
    const bgColor = isDarkMode ? '#121212' : '#ffffff';
    const pieColors = isDarkMode 
      ? ['#25F4EE', '#FE2C55', '#faad14', '#52c41a', '#722ed1', '#13c2c2', '#eb2f96', '#fa8c16']
      : ['#1677ff', '#4096ff', '#69b1ff', '#91caff', '#1677ff', '#0958d9', '#003eb3', '#002c8c'];

    const hasData = stats && stats.categoryDistribution && stats.categoryDistribution.length > 0;
    const seriesData = hasData 
      ? stats.categoryDistribution.map((item, index) => ({
          value: item.count,
          name: item.category,
          itemStyle: { color: pieColors[index % pieColors.length] }
        }))
      : [{ value: 1, name: '暂无', itemStyle: { color: '#d9d9d9' } }];

    return {
      title: { text: '类别分布', left: 'center', textStyle: { color: textColor, fontSize: 16, fontWeight: 600 } },
      tooltip: { trigger: 'item', formatter: '{b}: {c} ({d}%)' },
      legend: { orient: 'vertical', left: 'left', textStyle: { color: textColor } },
      series: [{
        name: '类别分布',
        type: 'pie',
        radius: ['40%', '70%'],
        avoidLabelOverlap: false,
        itemStyle: { borderRadius: 10, borderColor: bgColor, borderWidth: 2 },
        label: { show: false, position: 'center' },
        emphasis: { label: { show: true, fontSize: 18, fontWeight: 'bold', color: textColor } },
        labelLine: { show: false },
        data: seriesData,
        color: pieColors
      }],
      backgroundColor: bgColor
    };
  };

  const getMapOption = () => {
    const textColor = isDarkMode ? '#ffffff' : '#000000';
    const bgColor = isDarkMode ? '#121212' : '#ffffff';

    const hasData = stats && stats.countryDistribution && stats.countryDistribution.length > 0;
    
    // 地图数据必须用英文名才能匹配 GeoJSON
    const mapData = hasData 
      ? stats.countryDistribution.map(item => {
          const englishName = countryNameMap[item.country] || item.country;
          return {
            name: englishName,
            value: item.count,
            country: item.country,
            followers: item.totalFollowers
          };
        })
      : [];

    return {
      title: {
        text: '达人全球分布热力图',
        left: 'center',
        textStyle: { color: textColor, fontSize: 16, fontWeight: 600 }
      },
      tooltip: {
        trigger: 'item',
        formatter: (params) => {
          // 将英文名转换为中文
          const chineseName = englishToChineseMap[params.name] || params.name;
          if (params.data && params.data.country) {
            return `${params.data.country}<br/>达人数量: ${params.data.value || 0}<br/>总粉丝数: ${formatFollowers(params.data.followers || 0)}`;
          }
          return `${chineseName}<br/>暂无达人数据`;
        }
      },
      visualMap: {
        min: 0,
        max: hasData ? Math.max(...stats.countryDistribution.map(d => d.count)) : 10,
        text: ['高', '低'],
        realtime: false,
        calculable: true,
        inRange: {
          color: isDarkMode 
            ? ['#0d47a1', '#1976d2', '#25F4EE', '#FE2C55']
            : ['#e3f2fd', '#90caf9', '#1677ff', '#4096ff']
        },
        textStyle: { color: textColor },
        left: 'left',
        bottom: '20'
      },
      series: [{
        name: '达人分布',
        type: 'map',
        map: 'world',
        roam: true,
        zoom: 1.2,
        label: {
          show: false
        },
        emphasis: {
          label: { show: true, color: textColor },
          itemStyle: {
            areaColor: isDarkMode ? '#ffeb3b' : '#ff9800',
            shadowBlur: 10,
            shadowColor: 'rgba(0, 0, 0, 0.5)'
          }
        },
        itemStyle: {
          areaColor: isDarkMode ? '#1a1a1a' : '#e8e8e8',
          borderColor: isDarkMode ? '#2f2f2f' : '#999999',
          borderWidth: 0.5
        },
        data: mapData
      }],
      backgroundColor: bgColor
    };
  };

  const platformColumns = [
    { title: '平台', dataIndex: 'platform', key: 'platform', render: (platform) => <Tag color="blue">{platform}</Tag> },
    { title: '达人数量', dataIndex: 'count', key: 'count' }
  ];

  const categoryColumns = [
    { title: '类别', dataIndex: 'category', key: 'category', render: (category) => <Tag color="green">{category}</Tag> },
    { title: '达人数量', dataIndex: 'count', key: 'count' }
  ];

  const countryColumns = [
    { title: '国家', dataIndex: 'country', key: 'country', render: (country) => <Tag color="orange">{country}</Tag> },
    { title: '达人数量', dataIndex: 'count', key: 'count' },
    { 
      title: '总粉丝数', 
      dataIndex: 'totalFollowers', 
      key: 'totalFollowers',
      render: (value) => formatFollowers(value)
    }
  ];

  if (loading) {
    return <Spin size="large" />;
  }

  if (!stats) {
    return <div>暂无数据</div>;
  }

  return (
    <div>
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic title="达人总数" value={stats.totalKols} suffix="人" />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic title="总粉丝数" value={stats.totalFollowers} formatter={(value) => formatFollowers(value)} suffix="粉丝" />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic title="覆盖平台" value={stats.platforms.length} suffix="个" />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic title="覆盖国家" value={stats.countries.length} suffix="个" />
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24}>
          <Card>
            <div ref={mapChartRef} style={{ height: 500 }} />
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} lg={12}>
          <Card>
            <div ref={barChartRef} style={{ height: 400 }} />
          </Card>
        </Col>
        <Col xs={24} lg={12}>
          <Card>
            <div ref={pieChartRef} style={{ height: 400 }} />
          </Card>
        </Col>
      </Row>

      <Row gutter={16}>
        <Col xs={24} md={8}>
          <Card title="平台分布">
            <Table
              columns={platformColumns}
              dataSource={stats.platformDistribution}
              rowKey="platform"
              pagination={false}
              size="small"
            />
          </Card>
        </Col>
        <Col xs={24} md={8}>
          <Card title="类别分布">
            <Table
              columns={categoryColumns}
              dataSource={stats.categoryDistribution}
              rowKey="category"
              pagination={false}
              size="small"
            />
          </Card>
        </Col>
        <Col xs={24} md={8}>
          <Card title="国家分布">
            <Table
              columns={countryColumns}
              dataSource={stats.countryDistribution}
              rowKey="country"
              pagination={false}
              size="small"
            />
          </Card>
        </Col>
      </Row>
    </div>
  );
}

export default Stats;